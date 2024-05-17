import {
  revalidatePath,
  revalidateTag,
  unstable_cache as cache,
} from "next/cache"
import { type Data } from "@measured/puck"
import { streamResponse } from "@tohuhono/utils"
import { version } from "../package.json" with { type: "json" }
import {
  AddImageSchema,
  AddUserSchema,
  ChangeRoleSchema,
  DeletePageSchema,
  DeleteUserSchema,
  INITIAL_DATA,
  AddPageSchema,
  type AdapterActionGroup,
  type AdapterPermission,
  type OberonDatabaseAdapter,
  type OberonAdapter,
  type OberonPlugin,
  type OberonUser,
  type OberonPermissions,
  type OberonRole,
  PublishPageSchema,
  type OberonConfig,
  type MigrationResult,
  type TransformResult,
  type OberonPage,
  type PageData,
} from "./app/schema"
import {
  applyTransforms,
  getComponentTransformVersions,
  getTransforms,
} from "./app/transforms"

const permissions: OberonPermissions = {
  unauthenticated: {
    pages: "read",
  },
  user: {
    site: "read",
    pages: "write",
    images: "write",
  },
}

export function initAdapter({
  databaseAdapter,
  config,
  getCurrentUser,
  plugins = [],
  hasPermission = ({
    role = "unauthenticated" as const,
    action,
    permission,
  }) => {
    if (role === "admin") {
      return true
    }
    return (
      permissions[role][action] === permission ||
      permissions[role][action] === "write"
    )
  },
}: {
  databaseAdapter: OberonDatabaseAdapter
  config: OberonConfig
  getCurrentUser: () => Promise<OberonUser | null>
  plugins?: OberonPlugin[]
  hasPermission?: (props: {
    role?: OberonRole
    action: AdapterActionGroup
    permission: AdapterPermission
  }) => boolean
}): OberonAdapter {
  const db = plugins.reduce<OberonDatabaseAdapter>(
    (accumulator, plugin) => plugin(accumulator),
    databaseAdapter,
  )

  const can: OberonAdapter["can"] = async (action, permission = "read") => {
    // Check unauthenticated first so we can do it outside of request context
    if (hasPermission({ action, permission })) {
      return true
    }

    const user = await getCurrentUser()

    return hasPermission({ role: user?.role, action, permission })
  }

  const will = async (
    action: AdapterActionGroup,
    permission: AdapterPermission,
  ) => {
    if (await can(action, permission)) {
      return
    }
    throw new Error("Unauthorized")
  }

  const whoWill = async (
    action: AdapterActionGroup,
    permission: AdapterPermission,
  ) => {
    const user = await getCurrentUser()

    if (user && hasPermission({ role: user.role, action, permission })) {
      return user
    }
    throw new Error("Unauthorized")
  }

  const getAllPagesCached = cache(
    async () => {
      const sortPages = (a: { key: string }, b: { key: string }) => {
        if (a.key < b.key) {
          return -1
        }
        if (a.key > b.key) {
          return 1
        }
        return 0
      }
      const result = await db.getAllPages()

      const data = result.sort(sortPages)
      return data
    },
    undefined,
    { tags: ["oberon-pages"] },
  )

  const getAllPathsCached = cache(
    async () => {
      const result = await db.getAllPages()
      const data = result.map((row) => ({
        puckPath: row["key"].split("/").slice(1),
      }))
      return data
    },
    undefined,
    { tags: ["oberon-pages"] },
  )

  // TODO zod ; maybeGet
  const getPageDataCached = async (key: string): Promise<Data | null> => {
    const dataString = await db.getPageData(key)

    return dataString
  }

  const getAllUsersCached = cache(
    async () => {
      const allUsers = await db.getAllUsers()
      return allUsers || []
    },
    undefined,
    {
      tags: ["oberon-users"],
    },
  )

  const getAllImagesCached = cache(
    async () => {
      const allImages = await db.getAllImages()
      return allImages || []
    },
    undefined,
    {
      tags: ["oberon-images"],
    },
  )

  const updatePageData = async ({
    key,
    data,
    updatedBy,
  }: Pick<OberonPage, "key" | "data" | "updatedBy">) => {
    await db.updatePageData({
      key,
      data,
      updatedAt: new Date(),
      updatedBy,
    })
    revalidatePath(key)
    revalidateTag("oberon-pages")
  }

  const getConfigCached = cache(
    async () => {
      const site = await db.getSite()

      const { components, transforms } = getTransforms(site?.components, config)

      const siteConfig = {
        version,
        plugins: db.plugins,
        components,
        pendingMigrations: transforms && Object.keys(transforms),
      }

      if (!site) {
        await db.updateSite({
          version: config.version,
          components: getComponentTransformVersions(config),
          updatedAt: new Date(),
          updatedBy: "system",
        })
      }

      return siteConfig
    },
    undefined,
    {
      tags: ["oberon-config"],
    },
  )

  const migrate = streamResponse<
    TransformResult | MigrationResult,
    [OberonUser]
  >(async function* (user: OberonUser) {
    const summary: MigrationResult = {
      type: "summary",
      error: [],
      success: [],
      total: 0,
    }

    const site = await db.getSite()

    const { transforms } = getTransforms(site?.components, config)

    if (!transforms) {
      return summary
    }

    const pages = await getAllPagesCached()

    const results = applyTransforms({
      transforms,
      pages,
      getPageData: getPageDataCached,
      updatePageData,
    })

    for await (const result of results) {
      summary[result.status].push(result.key)
      yield result
    }

    await db.updateSite({
      version: config.version,
      components: getComponentTransformVersions(config),
      updatedAt: new Date(),
      updatedBy: user.email,
    })

    revalidateTag("oberon-config")

    yield { ...summary, total: pages.length }
  })

  return {
    /*
     * Auth
     */
    can,
    /*
     * Site actions
     */
    getConfig: async () => {
      await will("site", "read")
      return await getConfigCached()
    },
    migrateData: async () => {
      const user = await whoWill("site", "write")
      return migrate(user)
    },

    /*
     * Page actions
     */
    getAllPaths: async function () {
      await will("pages", "read")
      return getAllPathsCached()
    },
    getAllPages: async function () {
      await will("pages", "read")
      return getAllPagesCached()
    },
    getPageData: async function (key) {
      await will("pages", "read")
      return getPageDataCached(key)
    },
    // TODO return value
    addPage: async function (data: unknown) {
      const user = await whoWill("pages", "write")
      const { key } = AddPageSchema.parse(data)
      await db.addPage({
        key,
        data: INITIAL_DATA,
        updatedAt: new Date(),
        updatedBy: user.email,
      })
      revalidatePath(key)
      revalidateTag("oberon-pages")
    },
    // TODO return value
    deletePage: async function (data: unknown) {
      await will("pages", "write")
      const { key } = DeletePageSchema.parse(data)
      await db.deletePage(key)
      revalidatePath(key)
      revalidateTag("oberon-pages")
    },
    // TODO zod ; return value
    publishPageData: async function (data: unknown) {
      const user = await whoWill("pages", "write")
      const { key, data: pageData } = PublishPageSchema.parse(data)
      await updatePageData({
        key,
        data: pageData as PageData,
        updatedBy: user.email,
      })
    },

    /*
     * Image actions
     */
    getAllImages: async function () {
      await will("images", "read")
      return getAllImagesCached()
    },
    addImage: async function (data: unknown) {
      await will("images", "write")

      const image = AddImageSchema.parse(data)
      await db.addImage(image)
      revalidateTag("oberon-images")
      return db.getAllImages()
    },
    // TODO uploadthing
    deleteImage: async function (data) {
      await will("images", "write")
      revalidateTag("oberon-images")
      return db.deleteImage(data)
    },

    /*
     * User actions
     */
    getAllUsers: async function () {
      await will("users", "read")
      return getAllUsersCached()
    },
    addUser: async function (data: unknown) {
      await will("users", "write")
      const { email, role } = AddUserSchema.parse(data)

      try {
        const { id } = await db.addUser({
          email,
          role,
        })
        revalidateTag("oberon-users")
        return { id, email, role }
      } catch (_error) {
        console.error("Create user failed")
        return null
      }
    },
    deleteUser: async function (data: unknown) {
      await will("users", "write")
      const { id } = DeleteUserSchema.parse(data)
      try {
        await db.deleteUser(id)
        revalidateTag("oberon-users")
        return { id }
      } catch (_error) {
        console.error("Delete user failed")
        return null
      }
    },
    changeRole: async function (data: unknown) {
      await will("users", "write")
      const { role, id } = ChangeRoleSchema.parse(data)
      try {
        await db.changeRole({ role, id })
        revalidateTag("oberon-users")
        return { role, id }
      } catch (_error) {
        console.error("Change role failed")
        return null
      }
    },
  } satisfies OberonAdapter
}

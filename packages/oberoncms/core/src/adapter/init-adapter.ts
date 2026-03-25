import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"
import { type Data } from "@puckeditor/core"
import { streamResponse } from "@tohuhono/utils"
import { version } from "../../package.json" with { type: "json" }
import {
  AddImageSchema,
  AddUserSchema,
  ChangeRoleSchema,
  DeletePageSchema,
  DeleteUserSchema,
  INITIAL_DATA,
  AddPageSchema,
  PublishPageSchema,
  ResponseError,
  type AdapterActionGroup,
  type AdapterPermission,
  type OberonAdapter,
  type OberonUser,
  type OberonConfig,
  type MigrationResult,
  type TransformResult,
  type OberonPage,
  type OberonTailwindAsset,
  type PageData,
  type OberonPluginAdapter,
  type PluginVersion,
} from "../lib/dtd"
import {
  applyTransforms,
  getComponentTransformVersions,
  getTransforms,
} from "./transforms"
import { getInitialData } from "./get-initial-data"
import {
  buildTailwindAsset,
  getTailwindAssetDecision,
  getTailwindClassList,
  mergeTailwindClassLists,
} from "./tailwind-assets"

export function initAdapter({
  config,
  tailwind,
  versions,
  pluginAdapter: adapter,
}: {
  config: OberonConfig
  tailwind?: { sourceCssFile: string }
  pluginAdapter: OberonPluginAdapter
  versions: PluginVersion[]
}): OberonAdapter {
  const isPageData = (value: unknown): value is PageData => {
    return (
      typeof value === "object" &&
      value !== null &&
      "content" in value &&
      "root" in value
    )
  }

  const can: OberonAdapter["can"] = async (action, permission = "read") => {
    // Check unauthenticated first so we can do it outside of request context
    if (adapter.hasPermission({ action, permission })) {
      return true
    }

    const user = await adapter.getCurrentUser()

    return adapter.hasPermission({ user, action, permission })
  }

  const will = async (
    action: AdapterActionGroup,
    permission: AdapterPermission,
  ) => {
    if (await can(action, permission)) {
      return
    }
    throw new ResponseError("You do not have permission to perform this action")
  }

  const whoWill = async (
    action: AdapterActionGroup,
    permission: AdapterPermission,
  ) => {
    const user = await adapter.getCurrentUser()

    if (user && adapter.hasPermission({ user, action, permission })) {
      return user
    }
    throw new ResponseError("You do not have permission to perform this action")
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
      const result = await adapter.getAllPages()

      const data = result.sort(sortPages)
      return data
    },
    undefined,
    { tags: ["oberon-pages"] },
  )

  const getAllPathsCached = cache(
    async () => {
      const result = await adapter.getAllPages()
      const data = result.map((row) => ({
        path: row["key"].split("/").slice(1),
      }))
      return data
    },
    undefined,
    { tags: ["oberon-pages"] },
  )

  // TODO zod ; maybeGet
  const getPageDataCached = async (key: string): Promise<Data | null> => {
    const dataString = await adapter.getPageData(key)

    return dataString
  }

  const getAllUsersCached = cache(
    async () => {
      const allUsers = await adapter.getAllUsers()
      return allUsers || []
    },
    undefined,
    {
      tags: ["oberon-users"],
    },
  )

  const getAllImagesCached = cache(
    async () => {
      const allImages = await adapter.getAllImages()
      return allImages || []
    },
    undefined,
    {
      tags: ["oberon-images"],
    },
  )

  const ensureSite = async () => {
    const site = await adapter.getSite()

    if (site) {
      return site
    }

    const nextSite = {
      version: config.version,
      components: getComponentTransformVersions(config),
      activeTailwindHash: null,
      updatedAt: new Date(),
      updatedBy: "system",
    }

    await adapter.updateSite(nextSite)

    return nextSite
  }

  const getActiveTailwindHashCached = cache(
    async () => {
      const site = await adapter.getSite()
      return site?.activeTailwindHash ?? null
    },
    undefined,
    { tags: ["oberon-config"] },
  )

  const getTailwindAsset = async (
    hash: string,
  ): Promise<OberonTailwindAsset | null> => {
    return adapter.getTailwindAsset(hash)
  }

  const getTailwindState = async () => {
    const site = await ensureSite()
    const activeTailwindHash = site.activeTailwindHash ?? null

    return {
      activeTailwindHash,
      activeTailwindAsset: activeTailwindHash
        ? await adapter.getTailwindAsset(activeTailwindHash)
        : null,
    }
  }

  const getPublishedTailwindClassLists = async (
    ignoreKey?: string,
  ): Promise<string[][]> => {
    const pages = await adapter.getAllPages()
    const classLists = await Promise.all(
      pages
        .filter(({ key }) => key !== ignoreKey)
        .map(async ({ key }) => {
          const pageData = await adapter.getPageData(key)

          return pageData ? getTailwindClassList(pageData) : []
        }),
    )

    return classLists.filter((classList) => classList.length > 0)
  }

  const getTailwindPageUpdate = async ({
    key,
    data,
  }: Pick<OberonPage, "key" | "data">) => {
    if (!tailwind) {
      return {}
    }

    const submittedClassList = await getTailwindClassList(data)
    const { activeTailwindHash, activeTailwindAsset } = await getTailwindState()
    const publishedClassLists = await getPublishedTailwindClassLists(key)
    const { effectiveClassList, shouldCompile } = getTailwindAssetDecision({
      activeClassList: activeTailwindAsset?.classList ?? null,
      publishedClassLists,
      submittedClassList,
    })

    if (!shouldCompile) {
      return {
        baselineActiveTailwindHash: activeTailwindHash,
      }
    }

    const tailwindAsset = await buildTailwindAsset({
      classList: effectiveClassList,
      sourceCssFile: tailwind.sourceCssFile,
    })

    return {
      activeTailwindHash: tailwindAsset.hash,
      baselineActiveTailwindHash: activeTailwindHash,
      tailwindAsset,
    }
  }

  const syncActiveTailwindAsset = async ({
    invalidateCache = true,
    updatedBy = "build",
  }: {
    invalidateCache?: boolean
    updatedBy?: string
  } = {}) => {
    if (!tailwind) {
      return
    }

    const { activeTailwindHash, activeTailwindAsset } = await getTailwindState()
    const publishedClassLists = await getPublishedTailwindClassLists()
    const effectiveClassList = mergeTailwindClassLists(publishedClassLists)

    if (!effectiveClassList.length) {
      return
    }

    if (
      activeTailwindAsset &&
      getTailwindAssetDecision({
        activeClassList: activeTailwindAsset.classList,
        publishedClassLists: [],
        submittedClassList: effectiveClassList,
      }).shouldCompile === false
    ) {
      return
    }

    const tailwindAsset = await buildTailwindAsset({
      classList: effectiveClassList,
      sourceCssFile: tailwind.sourceCssFile,
    })

    await adapter.updateTailwind({
      tailwindAsset,
      activeTailwindHash: tailwindAsset.hash,
      baselineActiveTailwindHash: activeTailwindHash,
      updatedAt: new Date(),
      updatedBy,
    })

    if (invalidateCache) {
      updateTag("oberon-config")
    }
  }

  const updatePageData = async (
    { key, data, updatedBy }: Pick<OberonPage, "key" | "data" | "updatedBy">,
    { invalidateCache = true }: { invalidateCache?: boolean } = {},
  ) => {
    const tailwindUpdate = await getTailwindPageUpdate({ key, data })

    await adapter.updatePageData({
      key,
      data,
      ...tailwindUpdate,
      updatedAt: new Date(),
      updatedBy,
    })
    if (invalidateCache) {
      revalidatePath(key)
      updateTag("oberon-pages")
      if (tailwindUpdate.activeTailwindHash !== undefined) {
        updateTag("oberon-config")
      }
    }
  }

  const getConfigCached = cache(
    async () => {
      const site = await ensureSite()

      const { components, transforms } = getTransforms(site?.components, config)

      const siteConfig = {
        version,
        plugins: versions,
        components,
        pendingMigrations: transforms && Object.keys(transforms),
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

    const site = await adapter.getSite()

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

    await adapter.updateSite({
      version: config.version,
      components: getComponentTransformVersions(config),
      updatedAt: new Date(),
      updatedBy: user.email,
    })

    updateTag("oberon-config")

    yield { ...summary, total: pages.length }
  })

  return {
    prebuild: async () => {
      console.log("adapter prebuild")
      await adapter.prebuild()
      await ensureSite()
      const allPages = await adapter.getAllPages()

      if (!allPages.length) {
        console.log("Initialising welcome page")
        const { key, data, updatedBy } = getInitialData()
        await updatePageData(
          { key, data, updatedBy },
          { invalidateCache: false },
        )
      }

      await syncActiveTailwindAsset({ invalidateCache: false })
    },
    /*
     * Auth
     */
    can,
    signIn: adapter.signIn,
    signOut: adapter.signOut,
    /*
     * Site actions
     */
    getConfig: async () => {
      await will("site", "read")
      return await getConfigCached()
    },
    getActiveTailwindHash: async () => {
      return getActiveTailwindHashCached()
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
    getTailwindAsset: async function (hash) {
      return getTailwindAsset(hash)
    },
    getPageData: async function (key) {
      await will("pages", "read")
      return getPageDataCached(key)
    },
    // TODO return value
    addPage: async function (data: unknown) {
      const user = await whoWill("pages", "write")
      const { key } = AddPageSchema.parse(data)
      await adapter.addPage({
        key,
        data: INITIAL_DATA,
        updatedAt: new Date(),
        updatedBy: user.email,
      })
      revalidatePath(key)
      updateTag("oberon-pages")
    },
    // TODO return value
    deletePage: async function (data: unknown) {
      await will("pages", "write")
      const { key } = DeletePageSchema.parse(data)
      await adapter.deletePage(key)
      revalidatePath(key)
      updateTag("oberon-pages")
    },
    publishPageData: async function (data: unknown) {
      const user = await whoWill("pages", "write")
      const { key, data: pageData } = PublishPageSchema.parse(data)

      if (!isPageData(pageData)) {
        throw new ResponseError("Invalid page data")
      }

      await updatePageData({
        key,
        data: pageData,
        updatedBy: user.email,
      })
      return { message: `Successfully published ${key}` }
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
      await adapter.addImage(image)
      updateTag("oberon-images")
      return adapter.getAllImages()
    },
    // TODO uploadthing
    deleteImage: async function (data) {
      await will("images", "write")
      updateTag("oberon-images")
      return adapter.deleteImage(data)
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
      const { id } = await adapter.addUser({
        email,
        role,
      })
      updateTag("oberon-users")
      return { id, email, role }
    },
    deleteUser: async function (data: unknown) {
      await will("users", "write")
      const { id } = DeleteUserSchema.parse(data)
      await adapter.deleteUser(id)
      updateTag("oberon-users")
      return { id }
    },
    changeRole: async function (data: unknown) {
      await will("users", "write")
      const { role, id } = ChangeRoleSchema.parse(data)
      await adapter.changeRole({ role, id })
      updateTag("oberon-users")
      return { role, id }
    },
  }
}

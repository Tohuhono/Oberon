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
  type OberonClientConfig,
  type MigrationResult,
  type TransformResult,
  type OberonPage,
  type PageData,
  type OberonPluginAdapter,
  type PluginVersion,
} from "../lib/dtd"
import { applyTransforms, getComponentTransformVersions, getTransforms } from "./transforms"

export function initAdapter({
  config,
  versions,
  pluginAdapter: adapter,
}: {
  config: OberonClientConfig
  pluginAdapter: OberonPluginAdapter
  versions: PluginVersion[]
}): OberonAdapter {
  const isPageData = (value: unknown): value is PageData => {
    return typeof value === "object" && value !== null && "content" in value && "root" in value
  }

  const can: OberonAdapter["can"] = async (action, permission = "read") => {
    // Check unauthenticated first so we can do it outside of request context
    if (adapter.hasPermission({ action, permission })) {
      return true
    }

    const user = await adapter.getCurrentUser()

    return adapter.hasPermission({ user, action, permission })
  }

  const will = async (action: AdapterActionGroup, permission: AdapterPermission) => {
    if (await can(action, permission)) {
      return
    }
    throw new ResponseError("You do not have permission to perform this action")
  }

  const whoWill = async (action: AdapterActionGroup, permission: AdapterPermission) => {
    const user = await adapter.getCurrentUser()

    if (user && adapter.hasPermission({ user, action, permission })) {
      return user
    }
    throw new ResponseError("You do not have permission to perform this action")
  }

  const getAllPages = async () => {
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
  }

  const getAllPaths = async () => {
    const result = await adapter.getAllPages()
    const data = result.map((row) => ({
      path: row["key"].split("/").slice(1),
    }))
    return data
  }

  // TODO zod ; maybeGet
  const getPageData = (key: string) => adapter.getPageData(key)

  const getAllUsers = async () => {
    const allUsers = await adapter.getAllUsers()
    return allUsers || []
  }

  const getAllImages = async () => {
    const allImages = await adapter.getAllImages()
    return allImages || []
  }

  const updatePageData = ({
    key,
    data,
    updatedBy,
  }: Pick<OberonPage, "key" | "data" | "updatedBy">) =>
    adapter.updatePageData({
      key,
      data,
      updatedAt: new Date(),
      updatedBy,
    })

  const getConfig = async () => {
    const site = await adapter.getSite()

    const { components, transforms } = getTransforms(site?.components, config)

    const siteConfig = {
      version,
      plugins: versions,
      components,
      pendingMigrations: transforms && Object.keys(transforms),
    }

    return siteConfig
  }

  const migrate = streamResponse<TransformResult | MigrationResult, [OberonUser]>(async function* (
    user: OberonUser,
  ) {
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

    const pages = await getAllPages()

    const results = applyTransforms({
      transforms,
      pages,
      getPageData,
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

    yield { ...summary, total: pages.length }
  })

  return {
    getSetting: async (namespace, key) => {
      return adapter.getKV(namespace, key)
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
      return await getConfig()
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
      return getAllPaths()
    },
    getAllPages: async function () {
      await will("pages", "read")
      return getAllPages()
    },
    getPageData: async function (key) {
      await will("pages", "read")
      return getPageData(key)
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
    },
    // TODO return value
    deletePage: async function (data: unknown) {
      await will("pages", "write")
      const { key } = DeletePageSchema.parse(data)
      await adapter.deletePage(key)
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
      return getAllImages()
    },
    addImage: async function (data: unknown) {
      await will("images", "write")

      const image = AddImageSchema.parse(data)
      await adapter.addImage(image)
      return adapter.getAllImages()
    },
    // TODO uploadthing
    deleteImage: async function (data) {
      await will("images", "write")
      return adapter.deleteImage(data)
    },

    /*
     * User actions
     */
    getAllUsers: async function () {
      await will("users", "read")
      return getAllUsers()
    },
    addUser: async function (data: unknown) {
      await will("users", "write")
      const { email, role } = AddUserSchema.parse(data)
      const { id } = await adapter.addUser({
        email,
        role,
      })
      return { id, email, role }
    },
    deleteUser: async function (data: unknown) {
      await will("users", "write")
      const { id } = DeleteUserSchema.parse(data)
      await adapter.deleteUser(id)
      return { id }
    },
    changeRole: async function (data: unknown) {
      await will("users", "write")
      const { role, id } = ChangeRoleSchema.parse(data)
      await adapter.changeRole({ role, id })
      return { role, id }
    },
  }
}

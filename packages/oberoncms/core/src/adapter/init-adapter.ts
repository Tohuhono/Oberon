import { streamResponse } from "@tohuhono/utils"

import { version } from "../../package.json" with { type: "json" }
import {
  type OberonAdapter,
  type OberonUser,
  type OberonClientConfig,
  type MigrationResult,
  type TransformResult,
  type OberonPage,
  type OberonPluginAdapter,
  type PluginVersion,
} from "../lib/dtd"
import { applyTransforms, getComponentTransformVersions, getTransforms } from "./transforms"

export function initAdapter({
  config,
  versions,
  adapter,
}: {
  config: OberonClientConfig
  adapter: OberonPluginAdapter
  versions: PluginVersion[]
}): OberonAdapter {
  const can: OberonAdapter["can"] = async (action, permission = "read") => {
    // Check unauthenticated first so we can do it outside of request context
    if (adapter.hasPermission({ action, permission })) {
      return true
    }

    const user = await adapter.getCurrentUser()

    return adapter.hasPermission({ user, action, permission })
  }

  const readAllPages = adapter.getAllPages
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
    const result = await readAllPages()

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

  const readAllUsers = adapter.getAllUsers
  const getAllUsers = async () => {
    const allUsers = await readAllUsers()
    return allUsers || []
  }

  const readAllImages = adapter.getAllImages
  const getAllImages = async () => {
    const allImages = await readAllImages()
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

  const migrateData = streamResponse<TransformResult | MigrationResult, [OberonUser]>(
    async function* (user: OberonUser) {
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
        getPageData: adapter.getPageData,
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
    },
  )

  return Object.assign(adapter, {
    can,
    getAllImages,
    getAllPages,
    getAllPaths,
    getAllUsers,
    getConfig,
    migrateData,
  })
}

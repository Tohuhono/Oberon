import { streamResponse } from "@tohuhono/utils"

import { version } from "../../package.json" with { type: "json" }
import {
  type OberonAdapter,
  ResponseError,
  type OberonUser,
  type OberonConfig,
  type OberonHandler,
  type MigrationResult,
  type TransformResult,
  type OberonPage,
  type OberonPluginPhase,
} from "../lib/dtd"
import { initPlugins } from "./init-plugins"
import { applyTransforms, getComponentTransformVersions, getTransforms } from "./transforms"

function composeAdapter({ client: config, plugins = [] }: OberonConfig, phase: OberonPluginPhase) {
  const state: { adapter?: OberonAdapter } = {}
  const getAdapter = () => {
    if (!state.adapter) {
      throw new Error("Adapter used before initialization")
    }
    return state.adapter
  }
  const { adapter, bootstrap, handlers, versions } = initPlugins(plugins, {
    config,
    getAdapter,
    phase,
  })

  const can: OberonAdapter["can"] = async ({ action, permission = "read" }) => {
    // Check unauthenticated first so we can do it outside of request context
    if (adapter.hasPermission({ action, permission })) {
      return true
    }

    const user = await adapter.getCurrentUser()

    return adapter.hasPermission({ user, action, permission })
  }

  const will: OberonAdapter["will"] = async (data) => {
    if (!(await can(data))) {
      throw new ResponseError("You do not have permission to perform this action")
    }
  }

  const whoWill: OberonAdapter["whoWill"] = async ({ action, permission }) => {
    const user = await adapter.getCurrentUser()

    if (user && adapter.hasPermission({ user, action, permission })) {
      return user
    }
    throw new ResponseError("You do not have permission to perform this action")
  }

  let compiledHandlers: Record<string, OberonHandler> | undefined
  const handleRequest: OberonAdapter["handleRequest"] = async (request, { method, path = [] }) => {
    const action = typeof path === "string" ? path.split("/")[0] : path[0]

    if (!action) {
      return Response.json({}, { status: 404 })
    }

    compiledHandlers ??= Object.entries(handlers).reduce<Record<string, OberonHandler>>(
      (accumulator, [key, createHandler]) => {
        accumulator[key] = createHandler(getAdapter())
        return accumulator
      },
      {},
    )

    const handler = compiledHandlers[action]?.[method]

    if (!handler) {
      return Response.json({}, { status: 405 })
    }

    return handler(request)
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
        getPageData: (key) => adapter.getPageData({ key }),
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

  const finalAdapter: OberonAdapter = {
    ...adapter,
    can,
    getAllImages,
    getAllPages,
    getAllPaths,
    getAllUsers,
    getConfig,
    handleRequest,
    migrateData,
    will,
    whoWill,
  }
  state.adapter = finalAdapter

  return {
    adapter: finalAdapter,
    bootstrap: () => bootstrap(finalAdapter),
  }
}

export function initAdapter(config: OberonConfig): OberonAdapter {
  console.info("Initialise Oberon adapter")
  return composeAdapter(config, "runtime").adapter
}

export async function bootstrapAdapter(config: OberonConfig) {
  const { bootstrap } = composeAdapter(config, "bootstrap")
  await bootstrap()
}

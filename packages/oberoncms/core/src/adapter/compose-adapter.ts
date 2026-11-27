import { streamResponse } from "@tohuhono/utils"

import { version } from "../../package.json" with { type: "json" }
import {
  type OberonAdapter,
  type OberonConfig,
  type OberonHandler,
  type OberonPluginPhase,
  type OberonUser,
  ResponseError,
} from "../lib/dtd"
import { componentWrites } from "./component-writes"
import { initPlugins } from "./init-plugins"
import { getTransforms, migrateComponents } from "./transforms"

const sortComponents = (a: { key: string }, b: { key: string }) => {
  if (a.key < b.key) {
    return -1
  }
  if (a.key > b.key) {
    return 1
  }
  return 0
}

export function composeAdapter(
  { client: config, plugins = [] }: OberonConfig,
  phase: OberonPluginPhase,
) {
  const state: { adapter?: OberonAdapter } = {}
  const getAdapter = () => {
    if (!state.adapter) {
      throw new Error("Adapter used before initialization")
    }
    return state.adapter
  }
  const {
    adapter,
    handlers,
    plugins: definitions,
    versions,
  } = initPlugins(plugins, {
    getAdapter,
    phase,
  })

  const can: OberonAdapter["can"] = async ({ action, permission = "read" }) => {
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

  const readAllComponents = adapter.listComponents
  const listComponents: OberonAdapter["listComponents"] = async (type) => {
    const result = await readAllComponents(type)

    const data = result.sort(sortComponents)
    return data
  }

  const getPage: OberonAdapter["getPage"] = async ({ key }) => {
    await will({ action: "pages", permission: "read" })
    const component = await adapter.getComponent({ key })
    if (component?.type !== "page") return adapter.notFound()
    return { key, data: component.data }
  }

  const getAllPaths = async () => {
    const result = await adapter.listComponents("page")
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

  const { updateInTransaction, ...writes } = componentWrites(adapter)

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

  const migrateData: OberonAdapter["migrateData"] = streamResponse((user: OberonUser) =>
    migrateComponents(adapter, config, user, updateInTransaction),
  )

  const finalAdapter: OberonAdapter = {
    ...adapter,
    can,
    ...writes,
    getAllImages,
    listComponents,
    getAllPaths,
    getAllUsers,
    getConfig,
    getPage,
    handleRequest,
    migrateData,
    will,
    whoWill,
  }
  state.adapter = finalAdapter

  return { adapter: finalAdapter, plugins: definitions }
}

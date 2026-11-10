import { streamResponse } from "@tohuhono/utils"

import { version } from "../../package.json" with { type: "json" }
import {
  AddFragmentSchema,
  type MigrationResult,
  type OberonAdapter,
  type OberonConfig,
  type OberonHandler,
  type OberonFragment,
  type OberonPluginPhase,
  type OberonUser,
  ResponseError,
  type TransformResult,
} from "../lib/dtd"
import { initPlugins } from "./init-plugins"
import { applyTransforms, getComponentTransformVersions, getTransforms } from "./transforms"

const sortFragments = (a: { key: string }, b: { key: string }) => {
  if (a.key < b.key) {
    return -1
  }
  if (a.key > b.key) {
    return 1
  }
  return 0
}

function validateFragmentIdentity(fragment: Pick<OberonFragment, "key" | "type">) {
  const parsed = AddFragmentSchema.safeParse(fragment)
  if (!parsed.success) {
    throw new ResponseError(parsed.error.issues.map((issue) => issue.message).join(". "))
  }
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

  const readAllPages = adapter.getAllFragments
  const getAllFragments: OberonAdapter["getAllFragments"] = async (filter) => {
    const result = await readAllPages(filter)
    const data = result.sort(sortFragments)
    return data
  }

  const getAllPaths = async () => {
    const result = await adapter.getAllFragments({ type: "page" })
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

  const addFragment: OberonAdapter["addFragment"] = async (fragment) => {
    validateFragmentIdentity(fragment)
    await adapter.addFragment(fragment)
  }

  const updateFragmentData: OberonAdapter["updateFragmentData"] = async (fragment) => {
    validateFragmentIdentity(fragment)
    await adapter.updateFragmentData({
      ...fragment,
      updatedAt: new Date(Math.max(Date.now(), (fragment.expectedUpdatedAt?.getTime() ?? 0) + 1)),
    })
  }

  const deleteFragment: OberonAdapter["deleteFragment"] = async (fragment) => {
    validateFragmentIdentity(fragment)
    await adapter.deleteFragment(fragment)
  }

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

      const fragments = await getAllFragments({})

      const results = applyTransforms({
        transforms,
        fragments,
        getFragmentData: (key) => adapter.getFragmentData({ key }),
        updateFragmentData,
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

      yield { ...summary, total: fragments.length }
    },
  )

  const finalAdapter: OberonAdapter = {
    ...adapter,
    addFragment,
    can,
    deleteFragment,
    getAllImages,
    getAllFragments,
    getAllPaths,
    getAllUsers,
    getConfig,
    handleRequest,
    migrateData,
    will,
    whoWill,
    updateFragmentData,
  }
  state.adapter = finalAdapter

  return { adapter: finalAdapter, plugins: definitions }
}

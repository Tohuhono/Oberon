import {
  type OberonAdapter,
  type OberonClientConfig,
  type OberonHandler,
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPluginPhase,
  type OberonPermissions,
  type PluginVersion,
} from "../lib/dtd"
import { getInitialData } from "./get-initial-data"
import { stubbedAdapter } from "./stubbed-adapter"
import { getComponentTransformVersions } from "./transforms"

type InitialisedPlugins = {
  adapter: OberonPluginAdapter
  bootstrap: (adapter: OberonAdapter) => Promise<void>
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>
  versions: PluginVersion[]
}

function getBaseAdapter(): OberonPluginAdapter {
  return {
    ...stubbedAdapter,
    hasPermission: ({ user, action, permission }) => {
      const permissions: OberonPermissions = {
        unauthenticated: {
          pages: "read",
        },
        user: {
          site: "read",
          pages: "write",
          images: "write",
        },
        admin: {
          all: "write",
        },
      }
      const role = user?.role || ("unauthenticated" as const)

      if (role === "admin") {
        return true
      }
      return !!(
        permissions[role] &&
        permissions[role][action] &&
        (permissions[role][action] === permission ||
          permissions[role][action] === "write" ||
          permissions[role].all === permission ||
          permissions[role].all === "write")
      )
    },
  }
}

function composeAdapterHook<Key extends keyof OberonPluginAdapter>(
  plugins: ReturnType<OberonPlugin>[],
  getAdapter: () => OberonAdapter,
  baseAdapter: OberonPluginAdapter,
  key: Key,
) {
  return plugins.reduce<OberonPluginAdapter[Key]>((next, plugin) => {
    const hook = plugin.adapter?.[key]
    return hook ? hook({ getAdapter, next }) : next
  }, baseAdapter[key])
}

function composeAdapter(
  plugins: ReturnType<OberonPlugin>[],
  getAdapter: () => OberonAdapter,
): OberonPluginAdapter {
  const baseAdapter = getBaseAdapter()

  return (Object.keys(baseAdapter) as Array<keyof OberonPluginAdapter>).reduce(
    (adapter, key) => ({
      ...adapter,
      [key]: composeAdapterHook(plugins, getAdapter, baseAdapter, key),
    }),
    baseAdapter,
  )
}

export function initPlugins(
  plugins: OberonPlugin[] = [],
  {
    config,
    getAdapter,
    phase = "runtime",
  }: {
    config?: OberonClientConfig
    getAdapter: () => OberonAdapter
    phase?: OberonPluginPhase
  },
) {
  const definitions = plugins.map((plugin) => plugin({ phase }))
  const enabledPlugins = definitions.filter(({ disabled }) => !disabled)
  const adapter = composeAdapter(enabledPlugins, getAdapter)
  const handlers = enabledPlugins.reduce<InitialisedPlugins["handlers"]>(
    (accumulator, plugin) => ({
      ...accumulator,
      ...(phase === "runtime" ? plugin.handlers : {}),
    }),
    {},
  )
  const versions = definitions.map(({ name, disabled, version }) => ({
    name,
    disabled,
    version: version || "",
  }))

  return {
    adapter,
    handlers,
    versions,
    bootstrap: async (adapter) => {
      for (const plugin of enabledPlugins) {
        await plugin.bootstrap?.({ adapter })
      }

      const allPages = await adapter.getAllPages()
      if (!allPages.length) {
        console.log("Initialising welcome page")
        await adapter.updatePageData(getInitialData())
      }

      const site = await adapter.getSite()
      if (!site && config) {
        await adapter.updateSite({
          version: config.version,
          components: getComponentTransformVersions(config),
          updatedAt: new Date(),
          updatedBy: "system",
        })
      }
    },
  } satisfies InitialisedPlugins
}

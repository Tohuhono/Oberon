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
  bootstrap: () => Promise<void>
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
  adapter: OberonPluginAdapter,
  key: Key,
) {
  adapter[key] = plugins.reduce<OberonPluginAdapter[Key]>((next, plugin) => {
    const hook = plugin.adapter?.[key]
    return hook ? hook({ adapter, next }) : next
  }, adapter[key])
}

function composeAdapter(plugins: ReturnType<OberonPlugin>[]): OberonPluginAdapter {
  const adapter = getBaseAdapter()

  for (const key of Object.keys(adapter) as Array<keyof OberonPluginAdapter>) {
    composeAdapterHook(plugins, adapter, key)
  }

  return adapter
}

export function initPlugins(
  plugins: OberonPlugin[] = [],
  { config, phase = "runtime" }: { config?: OberonClientConfig; phase?: OberonPluginPhase } = {},
) {
  const definitions = plugins.map((plugin) => plugin({ phase }))
  const enabledPlugins = definitions.filter(({ disabled }) => !disabled)
  const adapter = composeAdapter(enabledPlugins)
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
    bootstrap: async () => {
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

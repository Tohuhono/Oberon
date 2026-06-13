import {
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPermissions,
  type PluginVersion,
  type OberonHandler,
  type OberonAdapter,
  type OberonPluginPhase,
  type OberonClientConfig,
} from "../lib/dtd"
import { getInitialData } from "./get-initial-data"
import { stubbedAdapter } from "./stubbed-adapter"
import { getComponentTransformVersions } from "./transforms"

type InititalisedPlugins = {
  adapter: OberonPluginAdapter
  bootstrap: () => Promise<void>
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>
  versions: PluginVersion[]
}

const baseAccumulator: InititalisedPlugins = {
  handlers: {},
  versions: [],
  bootstrap: async () => {},
  adapter: {
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
  } satisfies OberonPluginAdapter,
}

export function initPlugins(
  plugins: OberonPlugin[] = [],
  { config, phase = "runtime" }: { config?: OberonClientConfig; phase?: OberonPluginPhase } = {},
) {
  const oberon: InititalisedPlugins = plugins.reduce<InititalisedPlugins>((accumulator, plugin) => {
    const {
      name,
      version,
      disabled,
      adapter,
      handlers = {},
      bootstrap,
    } = plugin(accumulator.adapter, {
      phase,
    })

    if (disabled) {
      return {
        ...accumulator,
        versions: [...accumulator.versions, { name, disabled, version: version || "" }],
      }
    }

    return {
      versions: [...accumulator.versions, { name, disabled, version: version || "" }],
      handlers: {
        ...accumulator.handlers,
        ...(phase === "runtime" ? handlers : {}),
      },
      bootstrap: bootstrap ? () => bootstrap(accumulator.bootstrap) : accumulator.bootstrap,
      adapter: {
        ...accumulator.adapter,
        ...adapter,
      },
    } satisfies InititalisedPlugins
  }, baseAccumulator)

  return {
    ...oberon,
    bootstrap: async () => {
      await oberon.bootstrap()
      const allPages = await oberon.adapter.getAllPages()
      if (!allPages.length) {
        console.log("Initialising welcome page")
        await oberon.adapter.updatePageData(getInitialData())
      }

      const site = await oberon.adapter.getSite()
      if (!site && config) {
        await oberon.adapter.updateSite({
          version: config.version,
          components: getComponentTransformVersions(config),
          updatedAt: new Date(),
          updatedBy: "system",
        })
      }
    },
  } satisfies InititalisedPlugins
}

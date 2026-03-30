import {
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPermissions,
  type PluginVersion,
  type OberonHandler,
  type OberonAdapter,
} from "../lib/dtd"
import { stubbedAdapter } from "./stubbed-adapter"
import { getInitialData } from "./get-initial-data"

type InititalisedPlugins = {
  adapter: OberonPluginAdapter
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>
  versions: PluginVersion[]
}

const baseAccumulator: InititalisedPlugins = {
  handlers: {},
  versions: [],
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
      }
      const role = user?.role || ("unauthenticated" as const)

      if (role === "admin") {
        return true
      }
      return !!(
        permissions[role][action] &&
        (permissions[role][action] === permission ||
          permissions[role][action] === "write")
      )
    },
  } satisfies OberonPluginAdapter,
}

export function initPlugins(plugins: OberonPlugin[] = []) {
  const oberon: InititalisedPlugins = plugins.reduce<InititalisedPlugins>(
    (accumulator, plugin) => {
      const {
        name,
        version,
        disabled,
        adapter,
        handlers = {},
      } = plugin(accumulator.adapter)

      if (disabled) {
        return {
          ...accumulator,
          versions: [
            ...accumulator.versions,
            { name, disabled, version: version || "" },
          ],
        }
      }

      return {
        versions: [
          ...accumulator.versions,
          { name, disabled, version: version || "" },
        ],
        handlers: {
          ...accumulator.handlers,
          ...handlers,
        },
        adapter: {
          ...accumulator.adapter,
          ...adapter,
        },
      } satisfies InititalisedPlugins
    },
    baseAccumulator,
  )

  return {
    ...oberon,
    adapter: {
      ...oberon.adapter,
      prebuild: async () => {
        await oberon.adapter.prebuild()
        const allPages = await oberon.adapter.getAllPages()
        if (!allPages.length) {
          console.log("Initialising welcome page")
          await oberon.adapter.updatePageData(getInitialData())
        }
      },
    },
  } satisfies InititalisedPlugins
}

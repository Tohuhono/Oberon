import { type OberonPlugin, type OberonAdapter } from "../lib/dtd"
import { getInitialData } from "./get-initial-data"
import { baseAdapter } from "./base-adapter"

export function initAdapter(plugins: OberonPlugin[] = []) {
  const adapter: OberonAdapter = plugins.reduce<OberonAdapter>(
    (accumulator, plugin) => {
      const {
        name,
        version,
        disabled,
        adapter,
        handlers = {},
      } = plugin(accumulator)

      if (disabled) {
        return {
          ...accumulator,
          plugins: [
            ...accumulator.plugins,
            { name, disabled, version: version || "" },
          ],
        }
      }

      return {
        ...accumulator,
        plugins: [
          ...accumulator.plugins,
          { name, disabled, version: version || "" },
        ],
        handlers: {
          ...accumulator.handlers,
          ...handlers,
        },
        ...adapter,
      }
    },
    baseAdapter,
  )

  return {
    ...adapter,
    prebuild: async () => {
      await adapter.prebuild()
      const allPages = await adapter.getAllPages()
      if (!allPages.length) {
        console.log("Initialising welcome page")
        await adapter.updatePageData(getInitialData())
      }
    },
  } satisfies OberonAdapter
}

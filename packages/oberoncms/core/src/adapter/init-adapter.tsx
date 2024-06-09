import { type OberonPlugin, type OberonAdapter } from "../lib/dtd"
import { getInitialData } from "./get-initial-data"
import { baseAdapter } from "./base-adapter"

export function initAdapter(plugins: OberonPlugin[] = []) {
  const adapter = plugins.reduce<OberonAdapter>((accumulator, plugin) => {
    const { name, version, adapter, handlers = {} } = plugin(accumulator)
    return {
      ...accumulator,
      plugins: {
        ...accumulator.plugins,
        ...(name && { [name]: version || "" }),
      },
      handlers: {
        ...accumulator.handlers,
        ...handlers,
      },
      ...adapter,
    }
  }, baseAdapter)

  return {
    ...adapter,
    init: async () => {
      await adapter.init()
      const allPages = await adapter.getAllPages()
      if (!allPages.length) {
        console.log("Initialising welcome page")
        await adapter.updatePageData(getInitialData())
      }
    },
  } satisfies OberonAdapter
}

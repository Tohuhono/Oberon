import {
  type OberonAdapter,
  type OberonConfig,
  type OberonHandler,
  type OberonServerActions,
} from "../lib/dtd"
import { initActionHandler } from "./init-action-handler"
import { initAdapter } from "./init-adapter"
import { initHandler } from "./init-handler"
import { initPlugins } from "./init-plugins"

export function initOberon({ client, plugins }: OberonConfig): {
  handler: OberonHandler<{ path?: string[] | string }>
  adapter: OberonAdapter
  actionHandler: OberonServerActions
} {
  console.info("Initialise Oberon")

  const state: { adapter?: OberonAdapter } = {}
  const getAdapter = () => {
    if (!state.adapter) {
      throw new Error("Adapter used before initialization")
    }
    return state.adapter
  }

  const {
    versions,
    handlers,
    adapter: composedAdapter,
  } = initPlugins(plugins, {
    getAdapter,
    phase: "runtime",
  })

  const adapter = initAdapter({
    adapter: composedAdapter,
    config: client,
    versions,
  })
  state.adapter = adapter

  const handler = initHandler(adapter, handlers)

  const actionHandler = initActionHandler(adapter)

  return {
    handler,
    adapter,
    actionHandler,
  }
}

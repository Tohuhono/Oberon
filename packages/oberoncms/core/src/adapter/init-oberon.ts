import {
  type OberonAdapter,
  type OberonConfig,
  type OberonHandler,
  type OberonActionSurface,
} from "../lib/dtd"
import { initActionHandler } from "./init-action-handler"
import { initAdapter } from "./init-adapter"
import { initHandler } from "./init-handler"
import { initPlugins } from "./init-plugins"

export function initOberon({ client, plugins }: OberonConfig): {
  handler: OberonHandler<{ path?: string[] | string }>
  adapter: OberonAdapter
  actionHandler: OberonActionSurface
} {
  console.info("Initialise Oberon")

  const { versions, handlers, adapter: pluginAdapter } = initPlugins(plugins, { phase: "runtime" })

  const adapter = initAdapter({
    config: client,
    versions,
    pluginAdapter,
  })

  const handler = initHandler(adapter, handlers)

  const actionHandler = initActionHandler(adapter)

  return {
    handler,
    adapter,
    actionHandler,
  }
}

import { type OberonAdapter, type OberonConfig } from "../lib/dtd"
import { initAdapter } from "./init-adapter"
import { initPlugins } from "./init-plugins"

export async function bootstrapOberon({ client, plugins }: OberonConfig) {
  console.info("Bootstrap Oberon")

  const state: { adapter?: OberonAdapter } = {}
  const getAdapter = () => {
    if (!state.adapter) {
      throw new Error("Adapter used before initialization")
    }
    return state.adapter
  }

  const {
    adapter: composedAdapter,
    bootstrap,
    versions,
  } = initPlugins(plugins, {
    config: client,
    getAdapter,
    phase: "bootstrap",
  })
  const adapter = initAdapter({ adapter: composedAdapter, config: client, versions })
  state.adapter = adapter
  await bootstrap(adapter)
}

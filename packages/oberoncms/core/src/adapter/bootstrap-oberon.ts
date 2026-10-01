import { type OberonConfig } from "../lib/dtd"
import { composeAdapter } from "./compose-adapter"
import { getInitialData } from "./get-initial-data"
import { getComponentTransformVersions } from "./transforms"

export async function bootstrapOberon(config: OberonConfig) {
  console.info("Bootstrap Oberon")

  const { adapter, plugins } = composeAdapter(config, "bootstrap")

  for (const plugin of plugins) {
    await plugin.bootstrap?.()
  }

  const allPages = await adapter.getAllPages()
  if (!allPages.length) {
    console.log("Initialising welcome page")
    await adapter.updatePageData(getInitialData())
  }

  const site = await adapter.getSite()
  if (!site) {
    await adapter.updateSite({
      version: config.client.version,
      components: getComponentTransformVersions(config.client),
      updatedAt: new Date(),
      updatedBy: "system",
    })
  }
}

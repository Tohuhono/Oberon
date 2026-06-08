import "dotenv/config"
import { type OberonConfig } from "../lib/dtd"
import { initPlugins } from "./init-plugins"

export async function bootstrapOberon({ client, plugins }: OberonConfig) {
  console.info("Bootstrap Oberon")

  const { bootstrap } = initPlugins(plugins, { config: client, phase: "bootstrap" })
  await bootstrap()
}

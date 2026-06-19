import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as tanstackPlugin } from "@oberoncms/plugin-tanstack"

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [developmentPlugin, tanstackPlugin, authPlugin],
})

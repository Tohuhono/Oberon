import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { initOberon, mockPlugin } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [mockPlugin, developmentPlugin, authPlugin],
})

export const { handler, adapter } = initOberon(config)

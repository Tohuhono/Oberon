import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { initOberon, mockPlugin } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as nextjsPlugin } from "@oberoncms/plugin-nextjs"

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [mockPlugin, developmentPlugin, nextjsPlugin, authPlugin],
})

export const { handler, adapter } = initOberon(config)

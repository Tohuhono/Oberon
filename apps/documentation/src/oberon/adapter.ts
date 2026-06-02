import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { initOberon, mockPlugin } from "@oberoncms/core/adapter"

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [mockPlugin],
})

export const { adapter } = initOberon(config)

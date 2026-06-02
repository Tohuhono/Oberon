import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { mockPlugin } from "@oberoncms/core/adapter"

import { clientConfig } from "./client.config"

export const config = defineConfig({
  client: clientConfig,
  plugins: [mockPlugin],
})

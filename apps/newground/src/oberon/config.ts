import "server-cli-only"
import { defineConfig } from "@oberoncms/core"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as pgsqlPlugin } from "@oberoncms/plugin-pgsql"
import { plugin as tanstackPlugin } from "@oberoncms/plugin-tanstack"

import { clientConfig } from "./client.config"
import { plugin as resendPlugin } from "./send"

export const config = defineConfig({
  client: clientConfig,
  plugins: [developmentPlugin, pgsqlPlugin, resendPlugin, tanstackPlugin, authPlugin],
})

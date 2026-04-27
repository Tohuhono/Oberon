import "server-cli-only"

import { initOberon } from "@oberoncms/core/adapter"
import { betterAuthPlugin as authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as tailwindPlugin } from "@oberoncms/plugin-tailwind"

import { plugin as pgsqlPlugin } from "@oberoncms/plugin-pgsql"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [developmentPlugin, pgsqlPlugin, tailwindPlugin, authPlugin],
})

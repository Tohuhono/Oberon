import "server-cli-only"
import { initOberon } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as pgsqlPlugin } from "@oberoncms/plugin-pgsql"
import { plugin as tailwindPlugin } from "@oberoncms/plugin-tailwind"

import { config } from "./config"
import { plugin as resendPlugin } from "./send"

export const { adapter, handler } = initOberon({
  config,
  plugins: [developmentPlugin, pgsqlPlugin, resendPlugin, tailwindPlugin, authPlugin],
})

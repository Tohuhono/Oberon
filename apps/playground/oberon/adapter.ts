import "server-cli-only"

import { initOberon } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [developmentPlugin, tursoPlugin, authPlugin],
  tailwind: {
    sourceCssFile: new URL("../app/tailwind-asset.css", import.meta.url)
      .pathname,
  },
})

import "server-cli-only"

import path from "node:path"
import { initOberon } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [developmentPlugin, tursoPlugin, authPlugin],
  tailwind: {
    sourceCssFile: path.join(process.cwd(), "app/tailwind-asset.css"),
  },
})

import "server-cli-only"

import { initOberon, mockPlugin } from "@oberoncms/core/adapter"
import { plugin as developmentPlugin } from "@oberoncms/plugin-development"

import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [mockPlugin, developmentPlugin, tursoPlugin],
})

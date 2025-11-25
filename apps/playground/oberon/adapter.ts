import "server-cli-only"

import { initOberon, mockPlugin } from "@oberoncms/core/adapter"

import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [mockPlugin, developmentPlugin],
})

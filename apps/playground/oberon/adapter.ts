import "server-cli-only"

import { initOberon, mockPlugin } from "@oberoncms/core/adapter"

import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { config } from "./config"

export const { adapter, handler } = initOberon({
  config,
  plugins: [mockPlugin, tursoPlugin],
})

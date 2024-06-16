import "server-cli-only"

import { initOberon, mockPlugin } from "@oberoncms/core/adapter"
import { config } from "./config"

export const { adapter } = initOberon({
  config,
  plugins: [mockPlugin],
})

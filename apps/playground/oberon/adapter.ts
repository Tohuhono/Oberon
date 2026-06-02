import "server-cli-only"
import { initOberon } from "@oberoncms/core/adapter"

import { config } from "./config"

export const { adapter, handler } = initOberon(config)

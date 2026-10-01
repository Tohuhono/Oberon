import "server-cli-only"
import { initAdapter } from "@oberoncms/core/adapter"

import { config } from "./config"

export const adapter = initAdapter(config)

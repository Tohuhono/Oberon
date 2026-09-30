import "server-cli-only"
import { createRestHandler } from "@oberoncms/core/adapter"

import { adapter } from "./adapter"

export const restHandler = createRestHandler(adapter)

import "server-only"

import { initAdapter, mockPlugin } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"

export const adapter = initAdapter([mockPlugin, authPlugin])

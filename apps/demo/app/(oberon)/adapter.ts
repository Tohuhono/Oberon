import "server-only"

import { initAdapter, mockPlugin } from "@oberoncms/core/adapter"

export const adapter = initAdapter([mockPlugin])

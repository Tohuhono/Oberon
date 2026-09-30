import { createRestHandler } from "@oberoncms/core/adapter"

import { adapter } from "@/oberon/adapter"

export const { GET, POST, PUT, PATCH, DELETE } = createRestHandler(adapter)

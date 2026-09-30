import { createRestHandler } from "@oberoncms/plugin-nextjs"

import { adapter } from "@/oberon/adapter"

export const { GET, POST, PUT, PATCH, DELETE } = createRestHandler(adapter)

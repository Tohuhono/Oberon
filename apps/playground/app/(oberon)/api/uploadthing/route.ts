import { initRouteHandler } from "@oberoncms/plugin-uploadthing/plugin"
import { adapter } from "@/oberon/adapter"

export const { GET, POST } = initRouteHandler(adapter)

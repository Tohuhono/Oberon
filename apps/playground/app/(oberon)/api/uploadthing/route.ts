import { initRouteHandler } from "@oberoncms/plugin-uploadthing/plugin"
import { actions } from "@/oberon/adapter"

export const { GET, POST } = initRouteHandler(actions)

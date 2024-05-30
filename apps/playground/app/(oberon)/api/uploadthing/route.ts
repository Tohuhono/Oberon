import { initRouteHandler } from "@oberoncms/plugin-uploadthing/plugin"
import { actions } from "@/oberon/actions"

export const { GET, POST } = initRouteHandler(actions)

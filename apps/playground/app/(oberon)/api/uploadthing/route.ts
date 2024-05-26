import { initRouteHandler } from "@oberoncms/plugin-uploadthing/plugin"
import { actions } from "@/app/(oberon)/actions"

export const { GET, POST } = initRouteHandler(actions)

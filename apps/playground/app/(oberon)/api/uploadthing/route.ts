import { initRouteHandler } from "@oberoncms/upload-thing/plugin"
import { actions } from "@/app/(oberon)/actions"

export const { GET, POST } = initRouteHandler(actions)

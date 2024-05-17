import { initRouteHandler } from "@oberoncms/upload-thing/plugin"
import { adapter } from "@/app/(oberon)/adapter"

export const { GET, POST } = initRouteHandler(adapter)

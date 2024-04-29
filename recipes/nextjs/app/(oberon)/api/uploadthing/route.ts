import { initRouteHandler } from "@oberoncms/upload-thing/router"
import { adapter } from "@/app/(oberon)/server-config"

export const { GET, POST } = initRouteHandler(adapter)

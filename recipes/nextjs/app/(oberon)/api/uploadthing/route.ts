import { adapter } from "@oberoncms/adapter-turso"
import { initRouteHandler } from "@oberoncms/upload-thing/router"

export const { GET, POST } = initRouteHandler(adapter)

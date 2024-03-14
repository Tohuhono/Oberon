import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "src/uploadthing/file-router"

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})

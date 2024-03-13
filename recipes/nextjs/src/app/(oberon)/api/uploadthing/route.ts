import { ourFileRouter } from "src/uploadthing/file-router"
import { createRouteHandler } from "uploadthing/next"

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})

import {
  createUploadthing,
  createRouteHandler,
  FileRouter,
} from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import type { OberonActions } from "@oberoncms/core"
// TODO https://github.com/pingdotgg/uploadthing/issues/790
import type {} from "@uploadthing/shared"
import { getImageSize } from "./get-image-size"

const f = createUploadthing()

// TODO dry = async
// FileRouter for your app, can contain multiple FileRoutes
const initFileRouter = ({ can }: OberonActions) => {
  const imageMiddleware = async () => {
    // If you throw, the user will not be able to upload
    if (!(await can("images", "write"))) {
      throw new UploadThingError("Unauthorized")
    }

    // TODO getUser
    // Whatever is returned here is accessible in onUploadComplete as `metadata`
    return { creator: "unkown" }
  }

  return {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB" } })
      // Set permissions and file types for this FileRoute
      .middleware(imageMiddleware)
      .onUploadComplete(async ({ metadata: _metadata, file: { url } }) => {
        // This code is unauthorised
        // TODO add image type
        const { width, height } = await getImageSize(url)
        return { width, height }
      }),
    singleImageUploader: f({
      image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
      .middleware(imageMiddleware)
      .onUploadComplete(async ({ metadata: _metadata, file: { url } }) => {
        // This code is unauthorised
        // TODO add image type
        const { width, height } = await getImageSize(url)
        return { width, height }
      }),
  } satisfies FileRouter
}

export function initRouteHandler(adapter: OberonActions) {
  return createRouteHandler({
    router: initFileRouter(adapter),
  })
}

export type OurFileRouter = ReturnType<typeof initFileRouter>

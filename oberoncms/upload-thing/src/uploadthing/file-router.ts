import {
  createUploadthing,
  createRouteHandler,
  FileRouter,
} from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import type { OberonAdapter } from "@oberoncms/core"
import "server-only"

const f = createUploadthing()

// TODO dry = async
// FileRouter for your app, can contain multiple FileRoutes
function initFileRouter({
  auth,
  actions: { addAsset },
}: OberonAdapter): FileRouter {
  const imageMiddleware = async () => {
    // This code runs on your server before upload
    const session = await auth()

    // If you throw, the user will not be able to upload
    // @ts-expect-error TODO fix global types
    if (!session?.user.email) throw new UploadThingError("Unauthorized")

    // Whatever is returned here is accessible in onUploadComplete as `metadata`
    return { creator: session.user.email }
  }

  return {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB" } })
      // Set permissions and file types for this FileRoute
      .middleware(imageMiddleware)
      .onUploadComplete(
        async ({ metadata, file: { key, url, name, size } }) => {
          // This code RUNS ON YOUR SERVER after upload
          // TODO add asset type
          await addAsset({ key, url, name, size })
          console.log("Image Upload complete for userId:", metadata.creator)
        },
      ),
    singleImageUploader: f({
      image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
      .middleware(imageMiddleware)
      .onUploadComplete(
        async ({ metadata, file: { key, url, name, size } }) => {
          // This code RUNS ON YOUR SERVER after upload
          // TODO add asset type
          await addAsset({ key, url, name, size })
          console.log(
            "Single Image Upload complete for userId:",
            metadata.creator,
          )
          return { url, thor: "hmmm" }
        },
      ),
  }
}

export function initRouteHandler(adapter: OberonAdapter) {
  return createRouteHandler({
    router: initFileRouter(adapter),
  })
}

export type OurFileRouter = ReturnType<typeof initFileRouter>

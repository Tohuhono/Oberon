import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { db } from "src/db/client"
import { assets } from "src/db/schema"
import { auth } from "src/auth/next-auth"

const f = createUploadthing()

const imageMiddleware = async () => {
  // This code runs on your server before upload
  const session = await auth()

  // If you throw, the user will not be able to upload
  // @ts-expect-error TODO fix global type
  if (!session?.user.email) throw new Error("Unauthorized")

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return { creator: session.user.email }
}

// TODO dry

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(imageMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      db.insert(assets)
        .values({
          key: file.key,
          url: file.url,
          name: file.name,
          size: file.size,
        })
        .execute()
      console.log("Upload complete for userId:", metadata.creator)
    }),
  singleImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(imageMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      db.insert(assets)
        .values({
          key: file.key,
          url: file.url,
          name: file.name,
          size: file.size,
        })
        .execute()
      console.log("Upload complete for userId:", metadata.creator)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

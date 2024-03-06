import { generateReactHelpers } from "@uploadthing/react/hooks"
import { OurFileRouter } from "@/puck/src/uploadthing/file-router"

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()

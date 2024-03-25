import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react"

import type { OurFileRouter } from "./file-router"

export const UploadButton: ReturnType<
  typeof generateUploadButton<OurFileRouter>
> = generateUploadButton<OurFileRouter>()
export const UploadDropzone: ReturnType<
  typeof generateUploadDropzone<OurFileRouter>
> = generateUploadDropzone<OurFileRouter>()

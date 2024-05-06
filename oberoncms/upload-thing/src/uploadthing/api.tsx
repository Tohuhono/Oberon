import "server-only"

import { UTApi } from "uploadthing/server"

export const ourUploadthing = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET,
})

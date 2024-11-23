import "server-cli-only"

import { UTApi } from "uploadthing/server"

export const deleteImage = (key: string) => {
  const utapi = new UTApi({
    token: process.env.UPLOADTHING_SECRET,
  })
  return utapi.deleteFiles(key)
}

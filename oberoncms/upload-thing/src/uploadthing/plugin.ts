import type { OberonDatabaseAdapter } from "@oberoncms/core"
import { deleteImage } from "./api"

export const uploadthingPlugin = (
  adapter: OberonDatabaseAdapter,
): OberonDatabaseAdapter => ({
  ...adapter,
  deleteImage: async (key) => {
    await Promise.allSettled([
      //
      deleteImage(key),
      adapter.deleteImage(key),
    ])
  },
})

import type { OberonDatabaseAdapter } from "@oberoncms/core"
import { ourUploadthing } from "./api"

export const uploadthingPlugin = (
  adapter: OberonDatabaseAdapter,
): OberonDatabaseAdapter => ({
  ...adapter,
  deleteImage: async (key) => {
    await Promise.allSettled([
      ourUploadthing.deleteFiles(key),
      adapter.deleteUser(key),
    ])
  },
})

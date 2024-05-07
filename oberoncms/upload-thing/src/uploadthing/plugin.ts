import type { OberonDatabaseAdapter } from "@oberoncms/core"
import { deleteImage } from "./api"

export const uploadthingPlugin = (
  adapter: OberonDatabaseAdapter,
): OberonDatabaseAdapter => ({
  ...adapter,
  deleteImage: async (key) => {
    await Promise.all([
      //
      await deleteImage(key),
      await adapter.deleteImage(key),
    ])
  },
})

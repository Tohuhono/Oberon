import type { OberonDatabaseAdapter } from "@oberoncms/core"
import { name, version } from "../../package.json" with { type: "json" }
import { deleteImage } from "./api"

export const uploadthingPlugin = (
  adapter: OberonDatabaseAdapter,
): OberonDatabaseAdapter => ({
  ...adapter,
  plugins: {
    ...adapter.plugins,
    [name]: version,
  },
  deleteImage: async (key) => {
    await Promise.allSettled([
      //
      deleteImage(key),
      adapter.deleteImage(key),
    ])
  },
})

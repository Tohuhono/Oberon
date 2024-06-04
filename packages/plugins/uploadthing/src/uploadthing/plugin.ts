import type { OberonPlugin } from "@oberoncms/core"
import { name, version } from "../../package.json" with { type: "json" }
import { deleteImage } from "./api"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    deleteImage: async (key) => {
      await Promise.allSettled([
        //
        deleteImage(key),
        adapter.deleteImage(key),
      ])
    },
  },
})

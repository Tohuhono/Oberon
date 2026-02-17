import type { OberonBaseAdapter, OberonPlugin } from "@oberoncms/core"
import { name, version } from "../../package.json" with { type: "json" }
import { deleteImage } from "./api"
import { initRouteHandler } from "./file-router"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  handlers: {
    uploadthing: (adapter) => initRouteHandler(adapter),
  },
  adapter: {
    deleteImage: async (key) => {
      await Promise.allSettled([
        //
        deleteImage(key),
        adapter.deleteImage(key),
      ])
    },
  } satisfies Partial<OberonBaseAdapter>,
})

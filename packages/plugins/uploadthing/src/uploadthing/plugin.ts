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
      const results = await Promise.allSettled([
        adapter.deleteImage(key),
        deleteImage(key),
      ])

      const errors = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason)

      if (errors.length > 0) {
        throw new AggregateError(errors, "Image deletion failed")
      }
    },
  } satisfies Partial<OberonBaseAdapter>,
})

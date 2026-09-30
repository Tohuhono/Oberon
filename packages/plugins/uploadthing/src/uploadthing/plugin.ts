import type { OberonPlugin } from "@oberoncms/core"

import { name, version } from "../../package.json" with { type: "json" }
import { deleteImage } from "./api"
import { initRouteHandler } from "./file-router"

export const plugin: OberonPlugin = () => ({
  name,
  version,
  handlers: {
    uploadthing: (adapter) => initRouteHandler(adapter),
  },
  adapter: {
    deleteImage:
      ({ next }) =>
      async (data) => {
        const results = await Promise.allSettled([next(data), deleteImage(data.key)])

        const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason)

        if (errors.length > 0) {
          throw new AggregateError(errors, "Image deletion failed")
        }
      },
  },
})

import type { OberonBaseAdapter, OberonPlugin } from "@oberoncms/core"

import { Disk } from "flydrive"
import type { DriverContract } from "flydrive/types"
import { name, version } from "../../package.json" with { type: "json" }
import { initRouteHandler } from "./disk-handlers"

export const getFlyDrivePlugin = (diskDriver: DriverContract): OberonPlugin => {
  const driver = new Disk(diskDriver)

  return (adapter) => ({
    name,
    version,
    handlers: {
      flydrive: (adapter) => initRouteHandler(adapter, driver),
    },
    adapter: {
      deleteImage: async (key) => {
        const results = await Promise.allSettled([
          adapter.deleteImage(key),
          driver.delete(key),
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
}

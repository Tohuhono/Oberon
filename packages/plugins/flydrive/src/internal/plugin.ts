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
        await Promise.allSettled([driver.delete(key), adapter.deleteImage(key)])
      },
    } satisfies Partial<OberonBaseAdapter>,
  })
}

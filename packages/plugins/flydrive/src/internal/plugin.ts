import type { OberonPlugin } from "@oberoncms/core"

import { Disk } from "flydrive"
import type { DriverContract } from "flydrive/types"
import { name, version } from "../../package.json" with { type: "json" }
import { initRouteHandler } from "./disk-handlers"

interface plugin {
  flyDrivePlugin: OberonPlugin
  initFlyDriveRouter: () => ReturnType<typeof initRouteHandler>
}

export const getFlyDrivePlugin = (dickDriver: DriverContract): plugin => {
  const driver = new Disk(dickDriver)

  return {
    flyDrivePlugin: (adapter) => ({
      name,
      version,
      adapter: {
        deleteImage: async (key) => {
          await Promise.allSettled([
            //
            driver.delete(key),
            adapter.deleteImage(key),
          ])
        },
      },
    }),
    initFlyDriveRouter: () => initRouteHandler(driver),
  }
}

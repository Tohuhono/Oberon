import type { OberonPlugin } from "@oberoncms/core"

import { Disk } from "flydrive"
import { FSDriver } from "flydrive/drivers/fs"
import { GCSDriver } from "flydrive/drivers/gcs"
import { S3Driver } from "flydrive/drivers/s3"

import { name, version } from "../../package.json" with { type: "json" }
import { initRouteHandler } from "./disk-handlers"

type CloudFlyDriver = S3Driver | GCSDriver | FSDriver
const getDriverActions = (driver: CloudFlyDriver) => {
  const disk = new Disk(driver)
  if (driver instanceof FSDriver) {
    return Object.assign(disk, {
      type: "disk",
    })
  }
  if (driver instanceof S3Driver) {
    return Object.assign(disk, {
      type: "s3",
    })
  }
  if (driver instanceof GCSDriver) {
    return Object.assign(disk, {
      type: "gcs",
    })
  }
  throw new Error("Invalid driver")
}

export type DriverActions = ReturnType<typeof getDriverActions>

interface plugin {
  flyDrivePlugin: OberonPlugin
  initFlyDriveRouter: () => ReturnType<typeof initRouteHandler>
}

export const getFlyDrivePlugin = (driver: CloudFlyDriver): plugin => {
  const driverActions = getDriverActions(driver)

  return {
    flyDrivePlugin: (adapter) => ({
      name,
      version,
      adapter: {
        deleteImage: async (key) => {
          await Promise.allSettled([
            //
            driverActions.delete(key),
            adapter.deleteImage(key),
          ])
        },
      },
    }),
    initFlyDriveRouter: () => initRouteHandler(driverActions),
  }
}

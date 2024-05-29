import type { OberonPlugin } from "@oberoncms/core"
import { name, version } from "../../package.json" with { type: "json" }
import type { S3ClientFactoryProps } from "../s3"
import { S3DriverFactory, generateS3DriverFactoryDefault } from "../s3"
import { initRouteHandler } from "./handlers"

interface plugin {
  plugin: OberonPlugin
  initRouter: () => ReturnType<typeof initRouteHandler>
  driver: S3DriverFactory
}

export const getCustomPlugin = (settings: S3ClientFactoryProps): plugin => {
  const driver = new S3DriverFactory({
    client: settings.client,
    bucket: settings.bucket,
  })
  return {
    plugin: (adapter) => ({
      name,
      version,
      adapter: {
        deleteImage: async (key) => {
          await Promise.allSettled([
            //
            driver.deleteFile(key),
            adapter.deleteImage(key),
          ])
        },
      },
    }),
    initRouter: () => initRouteHandler(driver),
    driver,
  }
}

export const getDefaultPlugin = (): plugin => {
  const { driver } = generateS3DriverFactoryDefault()

  return {
    plugin: (adapter) => ({
      name,
      version,
      adapter: {
        deleteImage: async (key) => {
          await Promise.allSettled([
            //
            driver.deleteFile(key),
            adapter.deleteImage(key),
          ])
        },
      },
    }),
    initRouter: () => initRouteHandler(driver),
    driver,
  }
}

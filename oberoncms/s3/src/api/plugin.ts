import type { OberonDatabaseAdapter } from "@oberoncms/core"
import { name, version } from "../../package.json" with { type: "json" }
import { S3ClientFactory } from "../s3"
import type { S3ClientFactoryProps } from "../s3"
import { initRouteHandler } from "./handlers"
export { S3ENV } from "../s3/s3.config"

export type OberonAdapterExtraWithS3 = OberonDatabaseAdapter & {
  client: S3ClientFactory
}

const Plugin = (
  adapter: OberonDatabaseAdapter,
  client: S3ClientFactory,
): OberonAdapterExtraWithS3 => ({
  ...adapter,
  plugins: {
    ...adapter.plugins,
    [name]: version,
  },
  deleteImage: async (key) => {
    await Promise.allSettled([
      //
      client.deleteFile(key),
      adapter.deleteImage(key),
    ])
  },
  client,
})

export const initOberonS3Client = (props: S3ClientFactoryProps) => {
  const client = new S3ClientFactory(props)
  return {
    client,
    plugin: (adapter: OberonDatabaseAdapter) => Plugin(adapter, client),
    apiHandlers: () => initRouteHandler(client),
  }
}

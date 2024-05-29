import { S3Client } from "@aws-sdk/client-s3"
import { S3ENV } from "./s3.config"
import { S3DriverFactory } from "."

export const getClientConfig = () => ({
  region: S3ENV.AWS_REGION,
  endpoint: S3ENV.AWS_ENDPOINT,
  credentials: {
    accessKeyId: S3ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: S3ENV.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})
export const generateS3Client = () => {
  return new S3Client(getClientConfig())
}

export const generateS3DriverFactoryDefault = () => {
  const client = generateS3Client()
  return {
    driver: new S3DriverFactory({
      bucket: S3ENV.AWS_BUCKET,
      client,
    }),
    client,
    bucket: S3ENV.AWS_BUCKET,
  }
}

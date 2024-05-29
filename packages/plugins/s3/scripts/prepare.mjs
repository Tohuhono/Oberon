#!/usr/bin/env node
/* eslint-env node */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { S3Client, PutBucketPolicyCommand } from "@aws-sdk/client-s3"

const policy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:ListBucket", "s3:GetBucketLocation"],
      Resource: ["arn:aws:s3:::<AWS_BUCKET>"],
    },
    {
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: ["arn:aws:s3:::<AWS_BUCKET>/*"],
    },
  ],
}

const env = {
  NODE_ENV: process.env.NODE_ENV,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ENDPOINT: process.env.AWS_ENDPOINT,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET: process.env.AWS_BUCKET,
  AWS_MODE: process.env.AWS_MODE,
}
{
  const validateEnv = (env) => {
    // fallback to development
    if (!env.NODE_ENV) env.NODE_ENV = "development"
    if (
      !env.NODE_ENV ||
      !["development", "test", "production"].includes(env.NODE_ENV)
    ) {
      throw new Error("Invalid NODE_ENV")
    }

    if (!env.AWS_REGION) {
      throw new Error("AWS_REGION is required")
    }

    if (!env.AWS_ENDPOINT && env.AWS_MODE === "local") {
      throw new Error("AWS_ENDPOINT is required in local mode")
    } else if (env.AWS_ENDPOINT && env.AWS_MODE === "remote") {
      throw new Error("AWS_ENDPOINT is not allowed in remote mode")
    }

    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      throw new Error(
        "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required",
      )
    }

    if (!env.AWS_BUCKET) {
      throw new Error("AWS_BUCKET is required")
    }

    if (!env.AWS_MODE || !["local", "remote"].includes(env.AWS_MODE)) {
      throw new Error("Invalid AWS_MODE")
    }
  }
  validateEnv(env)
}
const S3ENV = env

const getClientConfig = () => ({
  region: S3ENV.AWS_REGION,
  endpoint: S3ENV.AWS_ENDPOINT,
  credentials: {
    accessKeyId: S3ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: S3ENV.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})
const generateS3Client = () => {
  return new S3Client(getClientConfig())
}

const applyBucketPolicy = async () => {
  if (S3ENV.AWS_MODE === "local") return
  const client = generateS3Client()
  try {
    await client.send(
      new PutBucketPolicyCommand({
        Bucket: S3ENV.AWS_BUCKET,
        Policy: JSON.stringify(policy).replaceAll(
          "<AWS_BUCKET>",
          S3ENV.AWS_BUCKET,
        ),
      }),
    )
    console.log("Policy applied successfully:")
  } catch (error) {
    console.error("Error applying policy:", error)
    throw new Error("Failed to apply bucket policy")
  }
}
;(async () => {
  try {
    await applyBucketPolicy()
  } catch (error) {
    console.error("Error applying policy:", error)
    process.exit(1)
  }
})()

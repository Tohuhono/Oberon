const env = {
  NODE_ENV: process.env.NODE_ENV as "development" | "test" | "production",
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_ENDPOINT: process.env.AWS_ENDPOINT as string | undefined,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_BUCKET: process.env.AWS_BUCKET as string,
  AWS_MODE: process.env.AWS_MODE as "local" | "remote",
} as const
{
  const validateEnv = (env: any) => {
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
export const S3ENV = env

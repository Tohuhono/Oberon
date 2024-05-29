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
  const validateEnv = (vars: typeof env) => {
    if (
      !vars.NODE_ENV ||
      !["development", "test", "production"].includes(vars.NODE_ENV)
    ) {
      throw new Error("Invalid NODE_ENV")
    }

    if (!vars.AWS_REGION) {
      throw new Error("AWS_REGION is required")
    }

    if (!vars.AWS_ENDPOINT && vars.AWS_MODE === "local") {
      throw new Error("AWS_ENDPOINT is required in local mode")
    } else if (vars.AWS_ENDPOINT && vars.AWS_MODE === "remote") {
      throw new Error("AWS_ENDPOINT is not allowed in remote mode")
    }

    if (!vars.AWS_ACCESS_KEY_ID || !vars.AWS_SECRET_ACCESS_KEY) {
      throw new Error(
        "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required",
      )
    }

    if (!vars.AWS_BUCKET) {
      throw new Error("AWS_BUCKET is required")
    }

    if (!vars.AWS_MODE || !["local", "remote"].includes(vars.AWS_MODE)) {
      throw new Error("Invalid AWS_MODE")
    }
  }
  validateEnv(env)
}
export const S3ENV = env

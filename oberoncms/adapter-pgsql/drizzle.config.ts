import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string,
  },
} satisfies Config

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  driver: "libsql",
  dbCredentials: {
    url: "file://.oberon/oberon.db",
  },
} satisfies Config

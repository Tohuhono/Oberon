import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  driver: "libsql",
} satisfies Config

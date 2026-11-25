import type { Config } from "drizzle-kit"

export default {
  schema: "../../oberoncms/sqlite/src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
} satisfies Config

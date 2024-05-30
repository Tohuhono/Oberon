import { migrate } from "drizzle-orm/vercel-postgres/migrator"
import { db } from "./client"

export async function prebuild() {
  console.log(`Migrating database`)

  if (!db) {
    console.log("Prepare: No Database Connection Configured")
    return
  }

  await migrate(db, {
    migrationsFolder:
      "node_modules/@oberoncms/plugin-vercel-postgres/src/db/migrations",
  })

  console.log(`Database migration complete`)
}

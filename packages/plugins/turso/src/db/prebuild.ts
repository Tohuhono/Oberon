import { migrate } from "drizzle-orm/libsql/migrator"
import { initialise, db } from "./client"

export async function prebuild() {
  console.log(`Initialising database`)

  await initialise()

  console.log(`Migrating database`)

  if (!db) {
    console.log("Prepare: No Database Connection Configured")
    return
  }

  await migrate(db, {
    migrationsFolder: "node_modules/@oberoncms/plugin-turso/src/db/migrations",
  })

  console.log(`Database migration complete`)
}
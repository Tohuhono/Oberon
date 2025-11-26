import { mkdir } from "fs/promises"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
// import type from here as
import type { Client } from "@libsql/core/api"

import { sql } from "drizzle-orm/sql"
import * as schema from "./schema"

declare global {
  var oberonDb: Client
}

const url = process.env.SQLITE_FILE || "file:.oberon/oberon.db"

// ensure there is only one database client
const getGlobalClient: () => Client = () =>
  globalThis.oberonDb || (globalThis.oberonDb = createClient({ url }))

export const getClient = () =>
  drizzle(getGlobalClient(), {
    schema,
  })

export async function initialise() {
  await mkdir(".oberon", { recursive: true })
  await getClient().run(sql`PRAGMA journal_mode=WAL;`)
}

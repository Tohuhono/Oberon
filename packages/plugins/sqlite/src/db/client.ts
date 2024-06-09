/* eslint-disable @typescript-eslint/no-var-requires */
import { mkdir } from "fs/promises"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
// import type from here as
import type { Client } from "@libsql/core/api"

import { sql } from "drizzle-orm/sql"
import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
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

export type DatabaseClient = LibSQLDatabase<typeof schema>

export async function initialise() {
  await mkdir(".oberon", { recursive: true })
  await getClient().run(sql`PRAGMA journal_mode=WAL;`)
}

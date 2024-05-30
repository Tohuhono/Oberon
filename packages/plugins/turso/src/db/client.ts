/* eslint-disable @typescript-eslint/no-var-requires */
import { mkdir } from "fs/promises"
import { drizzle } from "drizzle-orm/libsql"
import { createClient as createRemoteClient } from "@libsql/client/web"
import { createClient as createLocalClient } from "@libsql/client"
// import type from here as
import type { Client } from "@libsql/core/api"

import { sql } from "drizzle-orm/sql"
import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var oberonDb: Client
}

export const IS_LOCAL_CLIENT =
  process.env.TURSO_USE_REMOTE === "false" ||
  (process.env.TURSO_USE_REMOTE !== "true" &&
    process.env.NODE_ENV !== "production")

function getClient() {
  if (IS_LOCAL_CLIENT) {
    return createLocalClient({
      url: process.env.TURSO_FILE || "file:.oberon/oberon.db",
    })
  }

  if (!process.env.TURSO_URL || !process.env.TURSO_TOKEN) {
    throw new Error(
      "No remote database credentials supplied: have you set TURSO_URL and TURSO_TOKEN?",
    )
  }

  return createRemoteClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  })
}

// ensure there is only one database client
const client: Client =
  globalThis.oberonDb || (globalThis.oberonDb = getClient())

export const db = drizzle(client, {
  schema,
})

export async function initialise() {
  if (!IS_LOCAL_CLIENT) {
    return
  }
  await mkdir(".oberon", { recursive: true })
  await db.run(sql`PRAGMA journal_mode=WAL;`)
}

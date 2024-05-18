import "./env-config"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var oberonDb: Pool
}

const createRemoteClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No remote database credentials supplied: have you set database credentials?",
    )
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

const createLocalClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No local database credentials supplied: have you set database credentials?",
    )
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

const getClient = () => {
  if (process.env.NODE_ENV === "development") return createLocalClient()
  if (process.env.NODE_ENV === "production") return createRemoteClient()
  return createLocalClient()
}

// ensure there is only one database client
const pool: Pool = globalThis.oberonDb || (globalThis.oberonDb = getClient())

export const db = drizzle(pool, {
  schema,
})

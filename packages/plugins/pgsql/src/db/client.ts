import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import pg from "pg"
const { Pool } = pg
import * as schema from "./schema"

export type DatabaseClient = NodePgDatabase<typeof schema>

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

let db: DatabaseClient

const lazy = {
  get client() {
    db ??= drizzle(createRemoteClient(), {
      schema,
    }) satisfies DatabaseClient

    return db
  },
}

export const getClient = () => lazy.client

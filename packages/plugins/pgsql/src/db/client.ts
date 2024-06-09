import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

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

export const db = drizzle(createRemoteClient(), {
  schema,
})

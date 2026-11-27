import "server-cli-only"
import { sql } from "drizzle-orm"
import { migrate } from "drizzle-orm/libsql/migrator"

import { getAuthAdapter } from "./db/auth-adapter"
import type { DatabaseClient } from "./db/client"
import { getDatabaseAdapter } from "./db/database-adapter"

export { migrate }

export async function migrateComponentStorage(
  db: DatabaseClient,
  config: Parameters<typeof migrate>[1],
) {
  await migrate(db, config)
  // SQLite stores both timestamp modes as integers. Values in this range are seconds for Oberon records.
  await db.run(sql`
    UPDATE components
    SET updated_at = updated_at * 1000
    WHERE updated_at BETWEEN unixepoch('2000-01-01') AND 9999999999
  `)
}

export function getAdapter(getClient: () => DatabaseClient) {
  return { ...getDatabaseAdapter(getClient), ...getAuthAdapter(getClient) }
}

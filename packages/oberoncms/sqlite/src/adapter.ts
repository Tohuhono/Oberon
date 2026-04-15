import "server-cli-only"

export { migrate } from "drizzle-orm/libsql/migrator"

import { getDatabaseAdapter } from "./db/database-adapter"
import { getAuthAdapter } from "./db/auth-adapter"

import type { DatabaseClient } from "./db/client"

export function getAdapter(getClient: () => DatabaseClient) {
  return { ...getDatabaseAdapter(getClient), ...getAuthAdapter(getClient) }
}

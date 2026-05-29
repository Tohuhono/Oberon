import "server-cli-only"

export { migrate } from "drizzle-orm/libsql/migrator"

import { getAuthAdapter } from "./db/auth-adapter"
import type { DatabaseClient } from "./db/client"
import { getDatabaseAdapter } from "./db/database-adapter"

export function getAdapter(getClient: () => DatabaseClient) {
  return { ...getDatabaseAdapter(getClient), ...getAuthAdapter(getClient) }
}

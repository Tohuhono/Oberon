import type { LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

export type DatabaseClient = LibSQLDatabase<typeof schema>

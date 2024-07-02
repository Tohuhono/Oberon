import { DrizzleAdapter } from "@auth/drizzle-adapter"
import type { OberonAuthAdapter } from "@oberoncms/core"
import type { DatabaseClient } from "./client"

export const getAuthAdapter = (db: DatabaseClient): OberonAuthAdapter =>
  //@ts-expect-error https://github.com/drizzle-team/drizzle-orm/issues/1558
  DrizzleAdapter(db)

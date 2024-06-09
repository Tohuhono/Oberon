import { DrizzleAdapter } from "@auth/drizzle-adapter"
import type { OberonAuthAdapter } from "@oberoncms/core"
import { type DatabaseClient } from "./client"

export const getAuthAdapter: (db: DatabaseClient) => OberonAuthAdapter = (db) =>
  DrizzleAdapter(db) as OberonAuthAdapter

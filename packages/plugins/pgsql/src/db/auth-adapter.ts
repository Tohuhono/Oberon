import { type OberonAuthAdapter } from "@oberoncms/core"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import type { DatabaseClient } from "./client"
import * as schema from "./schema"

export const getAuthAdapter = (db: () => DatabaseClient): OberonAuthAdapter => ({
  getAuthDatabase: () =>
    drizzleAdapter(db(), {
      provider: "pg",
      schema,
    }),
  getAuthPlugins: () => [],
})

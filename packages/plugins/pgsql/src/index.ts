import "server-cli-only"

import type { OberonPlugin } from "@oberoncms/core"

import { migrate } from "drizzle-orm/node-postgres/migrator"
import { name, version } from "../package.json" with { type: "json" }

import { getDatabaseAdapter } from "./db/database-adapter"
import { getAuthAdapter } from "./db/auth-adapter"

import { db } from "./db/client"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    ...getDatabaseAdapter(db),
    ...getAuthAdapter(db),
    init: async () => {
      await adapter.init()

      console.log(`Migrating database`)

      if (!db) {
        console.log("Prepare: No Database Connection Configured")
        return
      }

      await migrate(db, {
        migrationsFolder:
          "node_modules/@oberoncms/plugin-pgsql/src/db/migrations",
      })

      console.log(`Database migration complete`)
    },
  },
})

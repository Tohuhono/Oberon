import "server-cli-only"

import {
  getAuthAdapter,
  getDatabaseAdapter,
  migrate,
} from "@oberoncms/plugin-sqlite/adapter"
import type { OberonPlugin } from "@oberoncms/core"
import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    ...getDatabaseAdapter(getClient),
    ...getAuthAdapter(getClient),
    init: async () => {
      await adapter.init()

      console.log(`Migrating database`)

      const db = getClient()

      if (!db) {
        console.log("Prepare: No Database Connection Configured")
        return
      }

      await migrate(db, {
        migrationsFolder:
          "node_modules/@oberoncms/plugin-turso/src/db/migrations",
      })

      console.log(`Database migration complete`)
    },
  },
})

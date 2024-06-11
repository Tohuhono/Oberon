import "server-cli-only"

import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"
import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  type OberonPlugin,
} from "@oberoncms/core"
import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    ...getAdapter(getClient),
    init: async () => {
      await adapter.prebuild()

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

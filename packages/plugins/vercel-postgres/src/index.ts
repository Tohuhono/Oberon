import "server-cli-only"

import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  type OberonPlugin,
} from "@oberoncms/core"

import { migrate } from "drizzle-orm/vercel-postgres/migrator"
import {
  getDatabaseAdapter,
  getAuthAdapter,
} from "@oberoncms/plugin-pgsql/adapter"
import { name, version } from "../package.json" with { type: "json" }
import { db } from "./db/client"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    ...getDatabaseAdapter(db),
    ...getAuthAdapter(db),
    init: async () => {
      await adapter.prebuild()
      console.log(`Migrating database`)

      if (!db) {
        console.log("Prepare: No Database Connection Configured")
        return
      }

      await migrate(db, {
        migrationsFolder:
          "node_modules/@oberoncms/plugin-vercel-postgres/src/db/migrations",
      })

      console.log(`Database migration complete`)
    },
  },
})

import "server-cli-only"

import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  type OberonDatabaseAdapter,
  type OberonPlugin,
} from "@oberoncms/core"

import { migrate } from "drizzle-orm/node-postgres/migrator"
import { name, version } from "../package.json" with { type: "json" }

import { getDatabaseAdapter } from "./db/database-adapter"
import { getAuthAdapter } from "./db/auth-adapter"

import { db } from "./db/client"

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/db/migrations",
)

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    ...getDatabaseAdapter(db),
    ...getAuthAdapter(db),
    prebuild: async () => {
      await adapter.prebuild()

      console.log(`Migrating database`)

      if (!db) {
        console.log("Prepare: No Database Connection Configured")
        return
      }

      await migrate(db, {
        migrationsFolder,
      })

      console.log(`Database migration complete`)
    },
  } satisfies OberonDatabaseAdapter,
})

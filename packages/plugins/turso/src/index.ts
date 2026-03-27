import "server-cli-only"

import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"
import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  type OberonDatabaseAdapter,
  type OberonPlugin,
} from "@oberoncms/core"
import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/db/migrations",
)

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    ...getAdapter(getClient),
    prebuild: async () => {
      await adapter.prebuild()

      console.log(`Migrating database`)

      const db = getClient()

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

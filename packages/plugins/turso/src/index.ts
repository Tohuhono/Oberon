import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  type OberonDatabaseAdapter,
  type OberonPlugin,
} from "@oberoncms/core"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"

import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  bootstrap: async (next) => {
    await next()

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
  adapter: {
    ...getAdapter(getClient),
  } satisfies OberonDatabaseAdapter,
})

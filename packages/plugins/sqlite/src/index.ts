import "server-cli-only"

import { type OberonPlugin } from "@oberoncms/core"

import { migrate } from "drizzle-orm/libsql/migrator"
import { name, version } from "../package.json" with { type: "json" }

import { getDatabaseAdapter } from "./db/database-adapter"
import { getAuthAdapter } from "./db/auth-adapter"
import { getClient, initialise } from "./db/client"

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    ...getDatabaseAdapter(getClient()),
    ...getAuthAdapter(getClient()),
    init: async () => {
      await adapter.init()

      console.log(`Migrating database`)

      await initialise()

      const db = getClient()

      if (!db) {
        console.log("Prepare: No Database Connection Configured")
        return
      }

      await migrate(db, {
        migrationsFolder:
          "node_modules/@oberoncms/plugin-sqlite/src/db/migrations",
      })

      console.log(`Database migration complete`)
    },
  },
})

export const withDevelopmentDatabase = (databasePlugin: OberonPlugin) => {
  if (process.env.USE_DEVELOPMENT_DATABASE === "true") {
    return plugin
  }

  if (process.env.USE_DEVELOPMENT_DATABASE === "false") {
    return databasePlugin
  }

  if (process.env.NODE_ENV === "development" && !process.env.CI) {
    return plugin
  }

  return databasePlugin
}

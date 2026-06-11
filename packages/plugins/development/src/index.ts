import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  USE_DEVELOPMENT_SEND_PLUGIN,
  type OberonDatabaseAdapter,
  type OberonPlugin,
  type OberonSendAdapter,
} from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { migrate } from "drizzle-orm/libsql/migrator"

import { name, version } from "../package.json" with { type: "json" }
import { getClient, initialise } from "./db/client"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => {
  console.log("USE_DEVELOPMENT_SEND_PLUGIN", USE_DEVELOPMENT_SEND_PLUGIN)
  return {
    name,
    version,
    disabled: !USE_DEVELOPMENT_SEND_PLUGIN && !USE_DEVELOPMENT_DATABASE_PLUGIN,
    bootstrap: async (next) => {
      if (USE_DEVELOPMENT_DATABASE_PLUGIN) {
        console.log(`Migrating database`)

        await initialise()

        const db = getClient()

        if (!db) {
          console.log("Prepare: No Database Connection Configured")
          await next()
          return
        }

        await migrate(db, {
          migrationsFolder,
        })

        console.log(`Database migration complete`)
      }

      await next()
    },
    adapter: {
      ...(USE_DEVELOPMENT_SEND_PLUGIN &&
        ({
          sendVerificationRequest: async (props) => {
            const { email, url, token } = props
            console.log(`sendVerificationRequest not sent in development`, {
              email,
              url,
              token,
            })
          },
        } satisfies OberonSendAdapter)),
      ...(USE_DEVELOPMENT_DATABASE_PLUGIN &&
        ({
          ...getAdapter(getClient),
        } satisfies OberonDatabaseAdapter)),
    },
  }
}

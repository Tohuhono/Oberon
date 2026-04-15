import "server-cli-only"

import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { migrate } from "drizzle-orm/libsql/migrator"
import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  USE_DEVELOPMENT_SEND_PLUGIN,
  type OberonBaseAdapter,
  type OberonInitAdapter,
  type OberonPlugin,
  type OberonSendAdapter,
} from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { name, version } from "../package.json" with { type: "json" }

import { getClient, initialise } from "./db/client"

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/db/migrations",
)

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  disabled: !USE_DEVELOPMENT_SEND_PLUGIN && !USE_DEVELOPMENT_DATABASE_PLUGIN,
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
        prebuild: async () => {
          await adapter.prebuild()

          console.log(`Migrating database`)

          await initialise()

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
      } satisfies OberonBaseAdapter & OberonInitAdapter)),
  },
})

import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  USE_DEVELOPMENT_SEND_PLUGIN,
  type OberonPlugin,
} from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { migrate } from "drizzle-orm/libsql/migrator"

import { name, version } from "../package.json" with { type: "json" }
import { getClient, initialise } from "./db/client"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => {
  const adapter = getAdapter(getClient)

  return {
    name,
    version,
    disabled: !USE_DEVELOPMENT_SEND_PLUGIN && !USE_DEVELOPMENT_DATABASE_PLUGIN,
    bootstrap: async () => {
      if (USE_DEVELOPMENT_DATABASE_PLUGIN) {
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
      }
    },
    adapter: {
      ...(USE_DEVELOPMENT_SEND_PLUGIN && {
        sendVerificationRequest:
          () =>
          async ({ email, url, token }) => {
            console.log(`sendVerificationRequest not sent in development`, {
              email,
              url,
              token,
            })
          },
      }),
      ...(USE_DEVELOPMENT_DATABASE_PLUGIN && {
        getAuthDatabase: () => adapter.getAuthDatabase,
        getAuthPlugins: () => adapter.getAuthPlugins,
        addPage: () => adapter.addPage,
        addImage: () => adapter.addImage,
        deletePage: () => adapter.deletePage,
        deleteImage: () => adapter.deleteImage,
        deleteKV: () => adapter.deleteKV,
        getAllImages: () => adapter.getAllImages,
        getAllPages: () => adapter.getAllPages,
        getPageData: () => adapter.getPageData,
        getKV: () => adapter.getKV,
        getSite: () => adapter.getSite,
        putKV: () => adapter.putKV,
        updatePageData: () => adapter.updatePageData,
        updateSite: () => adapter.updateSite,
        addUser: () => adapter.addUser,
        deleteUser: () => adapter.deleteUser,
        changeRole: () => adapter.changeRole,
        getAllUsers: () => adapter.getAllUsers,
      }),
    },
  }
}

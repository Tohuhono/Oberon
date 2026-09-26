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
        sendVerificationRequest: async ({ payload: { email, url, token } }) => {
          console.log(`sendVerificationRequest not sent in development`, {
            email,
            url,
            token,
          })
        },
      }),
      ...(USE_DEVELOPMENT_DATABASE_PLUGIN && {
        getAuthDatabase: () => adapter.getAuthDatabase(),
        getAuthPlugins: () => adapter.getAuthPlugins(),
        addPage: ({ payload: { page } }) => adapter.addPage(page),
        addImage: ({ payload: { image } }) => adapter.addImage(image),
        deletePage: ({ payload: { key } }) => adapter.deletePage(key),
        deleteImage: ({ payload: { key } }) => adapter.deleteImage(key),
        deleteKV: ({ payload: { namespace, key } }) => adapter.deleteKV(namespace, key),
        getAllImages: () => adapter.getAllImages(),
        getAllPages: () => adapter.getAllPages(),
        getPageData: ({ payload: { key } }) => adapter.getPageData(key),
        getKV: ({ payload: { namespace, key } }) => adapter.getKV(namespace, key),
        getSite: () => adapter.getSite(),
        putKV: ({ payload: { namespace, key, value } }) => adapter.putKV(namespace, key, value),
        updatePageData: ({ payload: { page } }) => adapter.updatePageData(page),
        updateSite: ({ payload: { site } }) => adapter.updateSite(site),
        addUser: ({ payload: { user } }) => adapter.addUser(user),
        deleteUser: ({ payload: { id } }) => adapter.deleteUser(id),
        changeRole: ({ payload }) => adapter.changeRole(payload),
        getAllUsers: () => adapter.getAllUsers(),
      }),
    },
  }
}

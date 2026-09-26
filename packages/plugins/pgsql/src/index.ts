import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { migrate } from "drizzle-orm/node-postgres/migrator"

import { name, version } from "../package.json" with { type: "json" }
import { getAuthAdapter } from "./db/auth-adapter"
import { getClient } from "./db/client"
import { getDatabaseAdapter } from "./db/database-adapter"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  bootstrap: async () => {
    console.log(`Migrating database`)

    if (!getClient()) {
      console.log("Prepare: No Database Connection Configured")
      return
    }

    await migrate(getClient(), {
      migrationsFolder,
    })

    console.log(`Database migration complete`)
  },
  adapter: {
    getAuthDatabase: () => getAuthAdapter(getClient).getAuthDatabase(),
    getAuthPlugins: () => getAuthAdapter(getClient).getAuthPlugins(),
    addPage: ({ payload: { page } }) => getDatabaseAdapter(getClient).addPage(page),
    addImage: ({ payload: { image } }) => getDatabaseAdapter(getClient).addImage(image),
    deletePage: ({ payload: { key } }) => getDatabaseAdapter(getClient).deletePage(key),
    deleteImage: ({ payload: { key } }) => getDatabaseAdapter(getClient).deleteImage(key),
    deleteKV: ({ payload: { namespace, key } }) =>
      getDatabaseAdapter(getClient).deleteKV(namespace, key),
    getAllImages: () => getDatabaseAdapter(getClient).getAllImages(),
    getAllPages: () => getDatabaseAdapter(getClient).getAllPages(),
    getPageData: ({ payload: { key } }) => getDatabaseAdapter(getClient).getPageData(key),
    getKV: ({ payload: { namespace, key } }) => getDatabaseAdapter(getClient).getKV(namespace, key),
    getSite: () => getDatabaseAdapter(getClient).getSite(),
    putKV: ({ payload: { namespace, key, value } }) =>
      getDatabaseAdapter(getClient).putKV(namespace, key, value),
    updatePageData: ({ payload: { page } }) => getDatabaseAdapter(getClient).updatePageData(page),
    updateSite: ({ payload: { site } }) => getDatabaseAdapter(getClient).updateSite(site),
    addUser: ({ payload: { user } }) => getDatabaseAdapter(getClient).addUser(user),
    deleteUser: ({ payload: { id } }) => getDatabaseAdapter(getClient).deleteUser(id),
    changeRole: ({ payload }) => getDatabaseAdapter(getClient).changeRole(payload),
    getAllUsers: () => getDatabaseAdapter(getClient).getAllUsers(),
  },
})

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
    getAuthDatabase: () => getAuthAdapter(getClient).getAuthDatabase,
    getAuthPlugins: () => getAuthAdapter(getClient).getAuthPlugins,
    addPage: () => getDatabaseAdapter(getClient).addPage,
    addImage: () => getDatabaseAdapter(getClient).addImage,
    deletePage: () => getDatabaseAdapter(getClient).deletePage,
    deleteImage: () => getDatabaseAdapter(getClient).deleteImage,
    deleteKV: () => getDatabaseAdapter(getClient).deleteKV,
    getAllImages: () => getDatabaseAdapter(getClient).getAllImages,
    getAllPages: () => getDatabaseAdapter(getClient).getAllPages,
    getPageData: () => getDatabaseAdapter(getClient).getPageData,
    getKV: () => getDatabaseAdapter(getClient).getKV,
    getSite: () => getDatabaseAdapter(getClient).getSite,
    putKV: () => getDatabaseAdapter(getClient).putKV,
    updatePageData: () => getDatabaseAdapter(getClient).updatePageData,
    updateSite: () => getDatabaseAdapter(getClient).updateSite,
    addUser: () => getDatabaseAdapter(getClient).addUser,
    deleteUser: () => getDatabaseAdapter(getClient).deleteUser,
    changeRole: () => getDatabaseAdapter(getClient).changeRole,
    getAllUsers: () => getDatabaseAdapter(getClient).getAllUsers,
  },
})

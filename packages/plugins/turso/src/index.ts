import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"

import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => ({
  name,
  version,
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  bootstrap: async () => {
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
    getAuthDatabase: () => getAdapter(getClient).getAuthDatabase,
    getAuthPlugins: () => getAdapter(getClient).getAuthPlugins,
    addPage: () => getAdapter(getClient).addPage,
    addImage: () => getAdapter(getClient).addImage,
    deletePage: () => getAdapter(getClient).deletePage,
    deleteImage: () => getAdapter(getClient).deleteImage,
    deleteKV: () => getAdapter(getClient).deleteKV,
    getAllImages: () => getAdapter(getClient).getAllImages,
    getAllPages: () => getAdapter(getClient).getAllPages,
    getPageData: () => getAdapter(getClient).getPageData,
    getKV: () => getAdapter(getClient).getKV,
    getSite: () => getAdapter(getClient).getSite,
    putKV: () => getAdapter(getClient).putKV,
    updatePageData: () => getAdapter(getClient).updatePageData,
    updateSite: () => getAdapter(getClient).updateSite,
    addUser: () => getAdapter(getClient).addUser,
    deleteUser: () => getAdapter(getClient).deleteUser,
    changeRole: () => getAdapter(getClient).changeRole,
    getAllUsers: () => getAdapter(getClient).getAllUsers,
  },
})

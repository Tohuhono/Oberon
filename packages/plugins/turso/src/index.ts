import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"

import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

// oxlint-disable-next-line unicorn/prefer-import-meta-properties -- Bundled output does not preserve import.meta.dirname.
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
    addComponent: () => getAdapter(getClient).addComponent,
    addImage: () => getAdapter(getClient).addImage,
    deleteComponent: () => getAdapter(getClient).deleteComponent,
    deleteImage: () => getAdapter(getClient).deleteImage,
    deleteKV: () => getAdapter(getClient).deleteKV,
    getAllImages: () => getAdapter(getClient).getAllImages,
    listComponents: () => getAdapter(getClient).listComponents,
    getComponent: () => getAdapter(getClient).getComponent,
    getKV: () => getAdapter(getClient).getKV,
    getSite: () => getAdapter(getClient).getSite,
    putKV: () => getAdapter(getClient).putKV,
    updateComponent: () => getAdapter(getClient).updateComponent,
    updateSite: () => getAdapter(getClient).updateSite,
    addUser: () => getAdapter(getClient).addUser,
    deleteUser: () => getAdapter(getClient).deleteUser,
    changeRole: () => getAdapter(getClient).changeRole,
    getAllUsers: () => getAdapter(getClient).getAllUsers,
  },
})

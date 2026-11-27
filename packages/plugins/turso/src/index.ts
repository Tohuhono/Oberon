import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { getAdapter, migrateComponentStorage } from "@oberoncms/sqlite/adapter"

import { name, version } from "../package.json" with { type: "json" }
import { getClient } from "./db/client"

// oxlint-disable-next-line unicorn/prefer-import-meta-properties -- Bundled output does not preserve import.meta.dirname.
const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => {
  const adapter = getAdapter(getClient)
  return {
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

      await migrateComponentStorage(db, {
        migrationsFolder,
      })

      console.log(`Database migration complete`)
    },
    adapter: {
      getAuthDatabase: () => adapter.getAuthDatabase,
      getAuthPlugins: () => adapter.getAuthPlugins,
      addComponent: () => adapter.addComponent,
      withComponentTransaction: () => adapter.withComponentTransaction,
      addImage: () => adapter.addImage,
      deleteComponent: () => adapter.deleteComponent,
      deleteImage: () => adapter.deleteImage,
      deleteKV: () => adapter.deleteKV,
      getAllImages: () => adapter.getAllImages,
      listComponents: () => adapter.listComponents,
      getComponent: () => adapter.getComponent,
      getKV: () => adapter.getKV,
      getSite: () => adapter.getSite,
      putKV: () => adapter.putKV,
      updateComponentData: () => adapter.updateComponentData,
      updateSite: () => adapter.updateSite,
      addUser: () => adapter.addUser,
      deleteUser: () => adapter.deleteUser,
      changeRole: () => adapter.changeRole,
      getAllUsers: () => adapter.getAllUsers,
    },
  }
}

import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"

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

      await migrate(db, {
        migrationsFolder,
      })

      console.log(`Database migration complete`)
    },
    adapter: {
      getAuthDatabase: () => adapter.getAuthDatabase,
      getAuthPlugins: () => adapter.getAuthPlugins,
      addFragment: () => adapter.addFragment,
      withFragmentTransaction: () => adapter.withFragmentTransaction,
      addImage: () => adapter.addImage,
      deleteFragment: () => adapter.deleteFragment,
      deleteImage: () => adapter.deleteImage,
      deleteKV: () => adapter.deleteKV,
      getAllImages: () => adapter.getAllImages,
      getAllFragments: () => adapter.getAllFragments,
      getFragmentData: () => adapter.getFragmentData,
      getKV: () => adapter.getKV,
      getSite: () => adapter.getSite,
      putKV: () => adapter.putKV,
      updateFragmentData: () => adapter.updateFragmentData,
      updateSite: () => adapter.updateSite,
      addUser: () => adapter.addUser,
      deleteUser: () => adapter.deleteUser,
      changeRole: () => adapter.changeRole,
      getAllUsers: () => adapter.getAllUsers,
    },
  }
}

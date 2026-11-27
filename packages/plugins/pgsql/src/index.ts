import "server-cli-only"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { USE_DEVELOPMENT_DATABASE_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { migrate } from "drizzle-orm/node-postgres/migrator"

import { name, version } from "../package.json" with { type: "json" }
import { getAuthAdapter } from "./db/auth-adapter"
import { getClient } from "./db/client"
import { getDatabaseAdapter } from "./db/database-adapter"

// oxlint-disable-next-line unicorn/prefer-import-meta-properties -- Bundled output does not preserve import.meta.dirname.
const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../src/db/migrations")

export const plugin: OberonPlugin = () => {
  const adapter = getDatabaseAdapter(getClient)
  return {
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

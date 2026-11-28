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
    addComponent: () => getDatabaseAdapter(getClient).addComponent,
    addImage: () => getDatabaseAdapter(getClient).addImage,
    deleteComponent: () => getDatabaseAdapter(getClient).deleteComponent,
    deleteImage: () => getDatabaseAdapter(getClient).deleteImage,
    deleteKV: () => getDatabaseAdapter(getClient).deleteKV,
    getAllImages: () => getDatabaseAdapter(getClient).getAllImages,
    listComponents: () => getDatabaseAdapter(getClient).listComponents,
    getComponent: () => getDatabaseAdapter(getClient).getComponent,
    getKV: () => getDatabaseAdapter(getClient).getKV,
    getSite: () => getDatabaseAdapter(getClient).getSite,
    putKV: () => getDatabaseAdapter(getClient).putKV,
    updateComponent: () => getDatabaseAdapter(getClient).updateComponent,
    updateSite: () => getDatabaseAdapter(getClient).updateSite,
    addUser: () => getDatabaseAdapter(getClient).addUser,
    deleteUser: () => getDatabaseAdapter(getClient).deleteUser,
    changeRole: () => getDatabaseAdapter(getClient).changeRole,
    getAllUsers: () => getDatabaseAdapter(getClient).getAllUsers,
  },
})

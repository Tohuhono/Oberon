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
    getAuthDatabase: () => getAdapter(getClient).getAuthDatabase(),
    getAuthPlugins: () => getAdapter(getClient).getAuthPlugins(),
    addPage: ({ payload: { page } }) => getAdapter(getClient).addPage(page),
    addImage: ({ payload: { image } }) => getAdapter(getClient).addImage(image),
    deletePage: ({ payload: { key } }) => getAdapter(getClient).deletePage(key),
    deleteImage: ({ payload: { key } }) => getAdapter(getClient).deleteImage(key),
    deleteKV: ({ payload: { namespace, key } }) => getAdapter(getClient).deleteKV(namespace, key),
    getAllImages: () => getAdapter(getClient).getAllImages(),
    getAllPages: () => getAdapter(getClient).getAllPages(),
    getPageData: ({ payload: { key } }) => getAdapter(getClient).getPageData(key),
    getKV: ({ payload: { namespace, key } }) => getAdapter(getClient).getKV(namespace, key),
    getSite: () => getAdapter(getClient).getSite(),
    putKV: ({ payload: { namespace, key, value } }) =>
      getAdapter(getClient).putKV(namespace, key, value),
    updatePageData: ({ payload: { page } }) => getAdapter(getClient).updatePageData(page),
    updateSite: ({ payload: { site } }) => getAdapter(getClient).updateSite(site),
    addUser: ({ payload: { user } }) => getAdapter(getClient).addUser(user),
    deleteUser: ({ payload: { id } }) => getAdapter(getClient).deleteUser(id),
    changeRole: ({ payload }) => getAdapter(getClient).changeRole(payload),
    getAllUsers: () => getAdapter(getClient).getAllUsers(),
  },
})

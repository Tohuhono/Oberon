import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  notImplemented,
  type OberonDatabaseAdapter,
  type OberonPlugin,
} from "@oberoncms/core"

export const databasePlugin: OberonPlugin = () => ({
  name: "Custom Database Plugin",
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    // OberonBaseAdapter
    addImage: notImplemented("addImage"),
    addPage: notImplemented("addPage"),
    deleteImage: notImplemented("deleteImage"),
    deletePage: notImplemented("deletePage"),
    deleteKV: notImplemented("deleteKV"),
    getAllImages: notImplemented("getAllImages"),
    getAllPages: notImplemented("getAllPages"),
    getPageData: notImplemented("getPageData"),
    getKV: notImplemented("getKV"),
    getSite: notImplemented("getSite"),
    putKV: notImplemented("putKV"),
    updatePageData: notImplemented("updatePageData"),
    updateSite: notImplemented("updateSite"),
    // OberonAuthAdapter
    getAuthDB: notImplemented("getAuthDB"),
    addUser: notImplemented("addUser"),
    changeRole: notImplemented("changeRole"),
    deleteUser: notImplemented("deleteUser"),
    getAllUsers: notImplemented("getAllUsers"),
  } satisfies OberonDatabaseAdapter,
})

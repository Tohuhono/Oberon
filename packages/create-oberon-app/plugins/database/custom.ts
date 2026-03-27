import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  notImplemented,
  type OberonDatabaseAdapter,
  type OberonInitAdapter,
  type OberonPlugin,
} from "@oberoncms/core"

export const databasePlugin: OberonPlugin = () => ({
  name: "Custom Database Plugin",
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    // Prebuild hook
    prebuild: notImplemented("prebuild"),
    // OberonBaseAdapter
    addImage: notImplemented("addImage"),
    addPage: notImplemented("addPage"),
    addUser: notImplemented("addUser"),
    changeRole: notImplemented("changeRole"),
    deleteImage: notImplemented("deleteImage"),
    deletePage: notImplemented("deletePage"),
    deleteKV: notImplemented("deleteKV"),
    deleteUser: notImplemented("deleteUser"),
    getAllImages: notImplemented("getAllImages"),
    getAllPages: notImplemented("getAllPages"),
    getAllUsers: notImplemented("getAllUsers"),
    getPageData: notImplemented("getPageData"),
    getKV: notImplemented("getKV"),
    getSite: notImplemented("getSite"),
    putKV: notImplemented("putKV"),
    updatePageData: notImplemented("updatePageData"),
    updateSite: notImplemented("updateSite"),
    // OberonAuthAdapter
    createSession: notImplemented("createSession"),
    createUser: notImplemented("createUser"),
    createVerificationToken: notImplemented("createVerificationToken"),
    deleteSession: notImplemented("deleteSession"),
    // deleteUser // duplicate
    getSessionAndUser: notImplemented("getSessionAndUser"),
    getUser: notImplemented("getUser"),
    getUserByAccount: notImplemented("getUserByAccount"),
    getUserByEmail: notImplemented("getUserByEmail"),
    linkAccount: notImplemented("linkAccount"),
    unlinkAccount: notImplemented("unlinkAccount"),
    useVerificationToken: notImplemented("useVerificationToken"),
    updateSession: notImplemented("updateSession"),
    updateUser: notImplemented("updateUser"),
  } satisfies OberonInitAdapter & OberonDatabaseAdapter,
})

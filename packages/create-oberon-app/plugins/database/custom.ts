import { USE_DEVELOPMENT_DATABASE_PLUGIN, notImplemented, type OberonPlugin } from "@oberoncms/core"

export const databasePlugin: OberonPlugin = () => ({
  name: "Custom Database Plugin",
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    // OberonBaseAdapter
    addImage: () => notImplemented("addImage"),
    addFragment: () => notImplemented("addFragment"),
    deleteImage: () => notImplemented("deleteImage"),
    deleteFragment: () => notImplemented("deleteFragment"),
    deleteKV: () => notImplemented("deleteKV"),
    getAllImages: () => notImplemented("getAllImages"),
    getAllFragments: () => notImplemented("getAllFragments"),
    getFragmentData: () => notImplemented("getFragmentData"),
    getFragmentRevision: () => notImplemented("getFragmentRevision"),
    getKV: () => notImplemented("getKV"),
    getSite: () => notImplemented("getSite"),
    putKV: () => notImplemented("putKV"),
    updateFragmentData: () => notImplemented("updateFragmentData"),
    updateSite: () => notImplemented("updateSite"),
    // OberonAuthAdapter
    addUser: () => notImplemented("addUser"),
    changeRole: () => notImplemented("changeRole"),
    deleteUser: () => notImplemented("deleteUser"),
    getAllUsers: () => notImplemented("getAllUsers"),
  },
})

import { USE_DEVELOPMENT_DATABASE_PLUGIN, notImplemented, type OberonPlugin } from "@oberoncms/core"

export const databasePlugin: OberonPlugin = () => ({
  name: "Custom Database Plugin",
  disabled: USE_DEVELOPMENT_DATABASE_PLUGIN,
  adapter: {
    // OberonBaseAdapter
    addImage: () => notImplemented("addImage"),
    addComponent: () => notImplemented("addComponent"),
    deleteImage: () => notImplemented("deleteImage"),
    deleteComponent: () => notImplemented("deleteComponent"),
    deleteKV: () => notImplemented("deleteKV"),
    getAllImages: () => notImplemented("getAllImages"),
    listComponents: () => notImplemented("listComponents"),
    getComponent: () => notImplemented("getComponent"),
    getKV: () => notImplemented("getKV"),
    getSite: () => notImplemented("getSite"),
    putKV: () => notImplemented("putKV"),
    updateComponentData: () => notImplemented("updateComponentData"),
    updateSite: () => notImplemented("updateSite"),
    // OberonAuthAdapter
    addUser: () => notImplemented("addUser"),
    changeRole: () => notImplemented("changeRole"),
    deleteUser: () => notImplemented("deleteUser"),
    getAllUsers: () => notImplemented("getAllUsers"),
  },
})

import type { OberonPermissions, OberonPluginAdapter } from "./schema"

const notImplemented = (action: string) => (): never => {
  throw new Error(
    `No oberon plugin provided for ${action} action, please check your oberon adapter configuration.`,
  )
}

export const baseAdapter: OberonPluginAdapter = {
  plugins: {},
  hasPermission: ({ user, action, permission }) => {
    const permissions: OberonPermissions = {
      unauthenticated: {
        pages: "read",
      },
      user: {
        site: "read",
        pages: "write",
        images: "write",
      },
    }
    const role = user?.role || ("unauthenticated" as const)

    if (role === "admin") {
      return true
    }
    return (
      permissions[role][action] === permission ||
      permissions[role][action] === "write"
    )
  },
  addImage: notImplemented("addImage"),
  addPage: notImplemented("addPage"),
  addUser: notImplemented("addUser"),
  changeRole: notImplemented("changeRole"),
  deleteImage: notImplemented("deleteImage"),
  deletePage: notImplemented("deletePage"),
  deleteUser: notImplemented("deleteUser"),
  getAllImages: notImplemented("getAllImages"),
  getAllPages: notImplemented("getAllPages"),
  getAllUsers: notImplemented("getAllUsers"),
  getCurrentUser: notImplemented("getCurrentUser"),
  getPageData: notImplemented("getPageData"),
  getSite: notImplemented("getSite"),
  updatePageData: notImplemented("updatePageData"),
  updateSite: notImplemented("updateSite"),
}

import { notImplemented } from "@tohuhono/utils"
import type { OberonPermissions, OberonAdapter } from "../lib/dtd"

export const baseAdapter: OberonAdapter = {
  plugins: [],
  handlers: {},
  getCurrentUser: notImplemented("getCurrentUser"),
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
  prebuild: async () => {},
  // OberonSendAdapter
  sendVerificationRequest: notImplemented("sendVerificationRequest"),
  // OberonDatabaseAdapter
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
  getPageData: notImplemented("getPageData"),
  getSite: notImplemented("getSite"),
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
}

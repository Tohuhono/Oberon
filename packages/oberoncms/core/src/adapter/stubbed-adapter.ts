import { notImplemented } from "../adapter"
import { type OberonPluginAdapter } from "../lib/dtd"

export const stubbedAdapter = {
  prebuild: async () => {},
  getCurrentUser: notImplemented("getCurrentUser"),
  hasPermission: notImplemented("hasPermission"),
  signIn: notImplemented("signIn"),
  signOut: notImplemented("signOut"),
  sendVerificationRequest: notImplemented("sendVerificationRequest"),
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
} satisfies OberonPluginAdapter

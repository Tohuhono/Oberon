import type { OberonActions } from "@oberoncms/core"
import { adapter } from "./adapter"

export const actions = {
  getConfig: async () => {
    "use server"
    return adapter.getConfig()
  },
  migrateData: async () => {
    "use server"
    return adapter.migrateData()
  },
  getAllPaths: async () => {
    "use server"
    return adapter.getAllPaths()
  },
  getAllPages: async () => {
    "use server"
    return adapter.getAllPages()
  },
  getPageData: async (key) => {
    "use server"
    return adapter.getPageData(key)
  },
  addPage: async (data) => {
    "use server"
    return adapter.addPage(data)
  },
  deletePage: async (data) => {
    "use server"
    return adapter.deletePage(data)
  },
  publishPageData: async (data) => {
    "use server"
    return adapter.publishPageData(data)
  },
  getAllImages: async () => {
    "use server"
    return adapter.getAllImages()
  },
  addImage: async (data) => {
    "use server"
    return adapter.addImage(data)
  },
  deleteImage: async (key) => {
    "use server"
    return adapter.deleteImage(key)
  },
  getAllUsers: async () => {
    "use server"
    return adapter.getAllUsers()
  },
  addUser: async (data) => {
    "use server"
    return adapter.addUser(data)
  },
  deleteUser: async (data) => {
    "use server"
    return adapter.deleteUser(data)
  },
  changeRole: async (data) => {
    "use server"
    return adapter.changeRole(data)
  },
  can: async (action, permission) => {
    "use server"
    return adapter.can(action, permission)
  },
} satisfies OberonActions

import "server-cli-only"

import type { AdapterPermission, OberonActions } from "@oberoncms/core"
import { initActions } from "@oberoncms/core/adapter"
import { config } from "./config"
import { adapter } from "./adapter"

const {
  addImage,
  addPage,
  addUser,
  changeRole,
  deleteImage,
  deletePage,
  deleteUser,
  getAllImages,
  getAllPages,
  getAllPaths,
  getAllUsers,
  getConfig,
  getPageData,
  migrateData,
  publishPageData,
  can,
} = initActions({
  config,
  adapter,
})

export const actions = {
  addImage: async (data) => {
    "use server"
    return addImage(data)
  },
  addPage: async (data) => {
    "use server"
    return addPage(data)
  },

  addUser: async (data) => {
    "use server"
    return addUser(data)
  },

  can: async (action, permission?: AdapterPermission) => {
    "use server"
    return can(action, permission)
  },
  changeRole: async (data) => {
    "use server"
    return changeRole(data)
  },
  deleteImage: async (key) => {
    "use server"
    return deleteImage(key)
  },
  deletePage: async (data) => {
    "use server"
    return deletePage(data)
  },
  deleteUser: async (data) => {
    "use server"
    return deleteUser(data)
  },
  getAllImages: async () => {
    "use server"
    return getAllImages()
  },

  getAllPages: async () => {
    "use server"
    return getAllPages()
  },
  getAllPaths: async () => {
    "use server"
    return getAllPaths()
  },

  getAllUsers: async () => {
    "use server"
    return getAllUsers()
  },
  getConfig: async () => {
    "use server"
    return getConfig()
  },

  getPageData: async (key) => {
    "use server"
    return getPageData(key)
  },
  migrateData: async () => {
    "use server"
    return migrateData()
  },

  publishPageData: async (data) => {
    "use server"
    return publishPageData(data)
  },
} satisfies OberonActions

import {
  wrap,
  type AdapterPermission,
  type OberonServerActions,
} from "@oberoncms/core"
import { adapter } from "./adapter"

export const actions = {
  addImage: async (data) => {
    "use server"
    return wrap(adapter.addImage(data))
  },
  addPage: async (data) => {
    "use server"
    return wrap(adapter.addPage(data))
  },

  addUser: async (data) => {
    "use server"
    return wrap(adapter.addUser(data))
  },

  can: async (action, permission?: AdapterPermission) => {
    "use server"
    return wrap(adapter.can(action, permission))
  },
  changeRole: async (data) => {
    "use server"
    return wrap(adapter.changeRole(data))
  },
  deleteImage: async (key) => {
    "use server"
    return wrap(adapter.deleteImage(key))
  },
  deletePage: async (data) => {
    "use server"
    return wrap(adapter.deletePage(data))
  },
  deleteUser: async (data) => {
    "use server"
    return wrap(adapter.deleteUser(data))
  },
  getAllImages: async () => {
    "use server"
    return wrap(adapter.getAllImages())
  },

  getAllPages: async () => {
    "use server"
    return wrap(adapter.getAllPages())
  },
  getAllPaths: async () => {
    "use server"
    return wrap(adapter.getAllPaths())
  },

  getAllUsers: async () => {
    "use server"
    return wrap(adapter.getAllUsers())
  },
  getConfig: async () => {
    "use server"
    return wrap(adapter.getConfig())
  },

  getPageData: async (key) => {
    "use server"
    return wrap(adapter.getPageData(key))
  },
  migrateData: async () => {
    "use server"
    return wrap(adapter.migrateData())
  },

  publishPageData: async (data) => {
    "use server"
    return wrap(adapter.publishPageData(data))
  },

  signIn: async (...props) => {
    "use server"
    return wrap(adapter.signIn(...props))
  },

  signOut: async () => {
    "use server"
    return wrap(adapter.signOut())
  },
} satisfies OberonServerActions

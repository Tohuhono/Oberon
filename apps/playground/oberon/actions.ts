import {
  wrap,
  type AdapterPermission,
  type OberonServerActions,
} from "@oberoncms/core"
import { actions } from "./adapter"

export const serverActions = {
  addImage: async (data) => {
    "use server"
    return wrap(actions.addImage(data))
  },
  addPage: async (data) => {
    "use server"
    return wrap(actions.addPage(data))
  },

  addUser: async (data) => {
    "use server"
    return wrap(actions.addUser(data))
  },

  can: async (action, permission?: AdapterPermission) => {
    "use server"
    return wrap(actions.can(action, permission))
  },
  changeRole: async (data) => {
    "use server"
    return wrap(actions.changeRole(data))
  },
  deleteImage: async (key) => {
    "use server"
    return wrap(actions.deleteImage(key))
  },
  deletePage: async (data) => {
    "use server"
    return wrap(actions.deletePage(data))
  },
  deleteUser: async (data) => {
    "use server"
    return wrap(actions.deleteUser(data))
  },
  getAllImages: async () => {
    "use server"
    return wrap(actions.getAllImages())
  },

  getAllPages: async () => {
    "use server"
    return wrap(actions.getAllPages())
  },
  getAllPaths: async () => {
    "use server"
    return wrap(actions.getAllPaths())
  },

  getAllUsers: async () => {
    "use server"
    return wrap(actions.getAllUsers())
  },
  getConfig: async () => {
    "use server"
    return wrap(actions.getConfig())
  },

  getPageData: async (key) => {
    "use server"
    return wrap(actions.getPageData(key))
  },
  migrateData: async () => {
    "use server"
    return wrap(actions.migrateData())
  },

  publishPageData: async (data) => {
    "use server"
    return wrap(actions.publishPageData(data))
  },

  signIn: async (...props) => {
    "use server"
    return wrap(actions.signIn(...props))
  },

  signOut: async () => {
    "use server"
    return wrap(actions.signOut())
  },
} satisfies OberonServerActions

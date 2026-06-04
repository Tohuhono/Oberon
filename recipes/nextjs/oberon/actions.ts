import type { OberonServerActions } from "@oberoncms/core"

import { actionsHandlers } from "./adapter"

export const actions = {
  addImage: async (...props) => {
    "use server"
    return actionsHandlers.addImage(...props)
  },
  addPage: async (...props) => {
    "use server"
    return actionsHandlers.addPage(...props)
  },
  addUser: async (...props) => {
    "use server"
    return actionsHandlers.addUser(...props)
  },
  can: async (...props) => {
    "use server"
    return actionsHandlers.can(...props)
  },
  changeRole: async (...props) => {
    "use server"
    return actionsHandlers.changeRole(...props)
  },
  deleteImage: async (...props) => {
    "use server"
    return actionsHandlers.deleteImage(...props)
  },
  deletePage: async (...props) => {
    "use server"
    return actionsHandlers.deletePage(...props)
  },
  deleteUser: async (...props) => {
    "use server"
    return actionsHandlers.deleteUser(...props)
  },
  getAllImages: async (...props) => {
    "use server"
    return actionsHandlers.getAllImages(...props)
  },
  getAllPages: async (...props) => {
    "use server"
    return actionsHandlers.getAllPages(...props)
  },
  getAllPaths: async (...props) => {
    "use server"
    return actionsHandlers.getAllPaths(...props)
  },
  getAllUsers: async (...props) => {
    "use server"
    return actionsHandlers.getAllUsers(...props)
  },
  getConfig: async (...props) => {
    "use server"
    return actionsHandlers.getConfig(...props)
  },
  getPageData: async (...props) => {
    "use server"
    return actionsHandlers.getPageData(...props)
  },
  migrateData: async (...props) => {
    "use server"
    return actionsHandlers.migrateData(...props)
  },
  publishPageData: async (...props) => {
    "use server"
    return actionsHandlers.publishPageData(...props)
  },
  signIn: async (...props) => {
    "use server"
    return actionsHandlers.signIn(...props)
  },
  signOut: async (...props) => {
    "use server"
    return actionsHandlers.signOut(...props)
  },
} satisfies OberonServerActions

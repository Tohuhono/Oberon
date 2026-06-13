import type { OberonServerActions } from "@oberoncms/core"

import { actionHandler } from "./adapter"

export const actions = {
  addImage: async (...props) => {
    "use server"
    return actionHandler.addImage(...props)
  },
  addPage: async (...props) => {
    "use server"
    return actionHandler.addPage(...props)
  },
  addUser: async (...props) => {
    "use server"
    return actionHandler.addUser(...props)
  },
  can: async (...props) => {
    "use server"
    return actionHandler.can(...props)
  },
  changeRole: async (...props) => {
    "use server"
    return actionHandler.changeRole(...props)
  },
  deleteImage: async (...props) => {
    "use server"
    return actionHandler.deleteImage(...props)
  },
  deletePage: async (...props) => {
    "use server"
    return actionHandler.deletePage(...props)
  },
  deleteUser: async (...props) => {
    "use server"
    return actionHandler.deleteUser(...props)
  },
  getAllImages: async (...props) => {
    "use server"
    return actionHandler.getAllImages(...props)
  },
  getAllPages: async (...props) => {
    "use server"
    return actionHandler.getAllPages(...props)
  },
  getAllPaths: async (...props) => {
    "use server"
    return actionHandler.getAllPaths(...props)
  },
  getAllUsers: async (...props) => {
    "use server"
    return actionHandler.getAllUsers(...props)
  },
  getConfig: async (...props) => {
    "use server"
    return actionHandler.getConfig(...props)
  },
  getPageData: async (...props) => {
    "use server"
    return actionHandler.getPageData(...props)
  },
  migrateData: async (...props) => {
    "use server"
    return actionHandler.migrateData(...props)
  },
  publishPageData: async (...props) => {
    "use server"
    return actionHandler.publishPageData(...props)
  },
  signIn: async (...props) => {
    "use server"
    return actionHandler.signIn(...props)
  },
  signOut: async (...props) => {
    "use server"
    return actionHandler.signOut(...props)
  },
} satisfies OberonServerActions

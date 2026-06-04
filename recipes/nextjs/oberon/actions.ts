import type { OberonServerActions } from "@oberoncms/core"

import { actions as oberonActions } from "./adapter"

export const actions = {
  addImage: async (...props) => {
    "use server"
    return oberonActions.addImage(...props)
  },
  addPage: async (...props) => {
    "use server"
    return oberonActions.addPage(...props)
  },
  addUser: async (...props) => {
    "use server"
    return oberonActions.addUser(...props)
  },
  can: async (...props) => {
    "use server"
    return oberonActions.can(...props)
  },
  changeRole: async (...props) => {
    "use server"
    return oberonActions.changeRole(...props)
  },
  deleteImage: async (...props) => {
    "use server"
    return oberonActions.deleteImage(...props)
  },
  deletePage: async (...props) => {
    "use server"
    return oberonActions.deletePage(...props)
  },
  deleteUser: async (...props) => {
    "use server"
    return oberonActions.deleteUser(...props)
  },
  getAllImages: async (...props) => {
    "use server"
    return oberonActions.getAllImages(...props)
  },
  getAllPages: async (...props) => {
    "use server"
    return oberonActions.getAllPages(...props)
  },
  getAllPaths: async (...props) => {
    "use server"
    return oberonActions.getAllPaths(...props)
  },
  getAllUsers: async (...props) => {
    "use server"
    return oberonActions.getAllUsers(...props)
  },
  getConfig: async (...props) => {
    "use server"
    return oberonActions.getConfig(...props)
  },
  getPageData: async (...props) => {
    "use server"
    return oberonActions.getPageData(...props)
  },
  migrateData: async (...props) => {
    "use server"
    return oberonActions.migrateData(...props)
  },
  publishPageData: async (...props) => {
    "use server"
    return oberonActions.publishPageData(...props)
  },
  signIn: async (...props) => {
    "use server"
    return oberonActions.signIn(...props)
  },
  signOut: async (...props) => {
    "use server"
    return oberonActions.signOut(...props)
  },
} satisfies OberonServerActions

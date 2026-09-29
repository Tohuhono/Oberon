import {
  AddImageSchema,
  AddPageSchema,
  AddUserSchema,
  CanSchema,
  ChangeRoleSchema,
  DeleteImageSchema,
  DeletePageSchema,
  DeleteUserSchema,
  PublishPageSchema,
  type OberonServerActions,
} from "@oberoncms/core"

import { actionHandler } from "./adapter"

export const actions = {
  addImage: async (...props) => {
    "use server"
    return actionHandler.addImage(AddImageSchema.parse(props[0]))
  },
  addPage: async (...props) => {
    "use server"
    return actionHandler.addPage(AddPageSchema.parse(props[0]))
  },
  addUser: async (...props) => {
    "use server"
    return actionHandler.addUser(AddUserSchema.parse(props[0]))
  },
  can: async (...props) => {
    "use server"
    return actionHandler.can(CanSchema.parse(props[0]))
  },
  changeRole: async (...props) => {
    "use server"
    return actionHandler.changeRole(ChangeRoleSchema.parse(props[0]))
  },
  deleteImage: async (...props) => {
    "use server"
    return actionHandler.deleteImage(DeleteImageSchema.parse(props[0]))
  },
  deletePage: async (...props) => {
    "use server"
    return actionHandler.deletePage(DeletePageSchema.parse(props[0]))
  },
  deleteUser: async (...props) => {
    "use server"
    return actionHandler.deleteUser(DeleteUserSchema.parse(props[0]))
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
    return actionHandler.getPageData(DeletePageSchema.parse(props[0]))
  },
  migrateData: async (...props) => {
    "use server"
    return actionHandler.migrateData(...props)
  },
  publishPageData: async (...props) => {
    "use server"
    return actionHandler.publishPageData(PublishPageSchema.parse(props[0]))
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

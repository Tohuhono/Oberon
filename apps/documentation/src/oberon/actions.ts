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
  addImage: async (data) => {
    "use server"
    return actionHandler.addImage(AddImageSchema.parse(data))
  },
  addPage: async (data) => {
    "use server"
    return actionHandler.addPage(AddPageSchema.parse(data))
  },
  addUser: async (data) => {
    "use server"
    return actionHandler.addUser(AddUserSchema.parse(data))
  },
  can: async (data) => {
    "use server"
    return actionHandler.can(CanSchema.parse(data))
  },
  changeRole: async (data) => {
    "use server"
    return actionHandler.changeRole(ChangeRoleSchema.parse(data))
  },
  deleteImage: async (data) => {
    "use server"
    return actionHandler.deleteImage(DeleteImageSchema.parse(data))
  },
  deletePage: async (data) => {
    "use server"
    return actionHandler.deletePage(DeletePageSchema.parse(data))
  },
  deleteUser: async (data) => {
    "use server"
    return actionHandler.deleteUser(DeleteUserSchema.parse(data))
  },
  getAllImages: async () => {
    "use server"
    return actionHandler.getAllImages()
  },
  getAllPages: async () => {
    "use server"
    return actionHandler.getAllPages()
  },
  getAllPaths: async () => {
    "use server"
    return actionHandler.getAllPaths()
  },
  getAllUsers: async () => {
    "use server"
    return actionHandler.getAllUsers()
  },
  getConfig: async () => {
    "use server"
    return actionHandler.getConfig()
  },
  getPageData: async (data) => {
    "use server"
    return actionHandler.getPageData(DeletePageSchema.parse(data))
  },
  migrateData: async () => {
    "use server"
    return actionHandler.migrateData()
  },
  publishPageData: async (data) => {
    "use server"
    return actionHandler.publishPageData(PublishPageSchema.parse(data))
  },
  signIn: async (data) => {
    "use server"
    return actionHandler.signIn(data)
  },
  signOut: async () => {
    "use server"
    return actionHandler.signOut()
  },
} satisfies OberonServerActions

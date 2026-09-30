import {
  AddImageSchema,
  AddPageSchema,
  AddUserSchema,
  CanSchema,
  ChangeRoleSchema,
  DeleteImageSchema,
  DeletePageSchema,
  DeleteUserSchema,
  GetAllImagesSchema,
  GetAllPagesSchema,
  GetAllPathsSchema,
  GetAllUsersSchema,
  GetConfigSchema,
  GetPageDataSchema,
  MigrateDataSchema,
  PublishPageSchema,
  SignInSchema,
  SignOutSchema,
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
  getAllImages: async (data) => {
    "use server"
    return actionHandler.getAllImages(GetAllImagesSchema.parse(data))
  },
  getAllPages: async (data) => {
    "use server"
    return actionHandler.getAllPages(GetAllPagesSchema.parse(data))
  },
  getAllPaths: async (data) => {
    "use server"
    return actionHandler.getAllPaths(GetAllPathsSchema.parse(data))
  },
  getAllUsers: async (data) => {
    "use server"
    return actionHandler.getAllUsers(GetAllUsersSchema.parse(data))
  },
  getConfig: async (data) => {
    "use server"
    return actionHandler.getConfig(GetConfigSchema.parse(data))
  },
  getPageData: async (data) => {
    "use server"
    return actionHandler.getPageData(GetPageDataSchema.parse(data))
  },
  migrateData: async (data) => {
    "use server"
    return actionHandler.migrateData(MigrateDataSchema.parse(data))
  },
  publishPageData: async (data) => {
    "use server"
    return actionHandler.publishPageData(PublishPageSchema.parse(data))
  },
  signIn: async (data) => {
    "use server"
    return actionHandler.signIn(SignInSchema.parse(data))
  },
  signOut: async (data) => {
    "use server"
    return actionHandler.signOut(SignOutSchema.parse(data))
  },
} satisfies OberonServerActions

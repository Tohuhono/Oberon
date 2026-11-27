import {
  AddImageSchema,
  AddComponentSchema,
  AddUserSchema,
  CanSchema,
  ChangeRoleSchema,
  DeleteImageSchema,
  DeleteComponentSchema,
  DeleteUserSchema,
  GetAllImagesSchema,
  ListComponentsSchema,
  GetAllPathsSchema,
  GetAllUsersSchema,
  GetConfigSchema,
  GetComponentSchema,
  MigrateDataSchema,
  PublishComponentSchema,
  ResolvePathSchema,
  SignInSchema,
  SignOutSchema,
  type OberonServerActions,
} from "@oberoncms/core"
import { createActionHandler } from "@oberoncms/core/adapter"

import { adapter } from "./adapter"

const actionHandler = createActionHandler(adapter)

export const actions = {
  resolvePath: async (data) => {
    "use server"
    return actionHandler.resolvePath(ResolvePathSchema.parse(data))
  },
  addImage: async (data) => {
    "use server"
    return actionHandler.addImage(AddImageSchema.parse(data))
  },
  addComponent: async (data) => {
    "use server"
    return actionHandler.addComponent(AddComponentSchema.parse(data))
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
  deleteComponent: async (data) => {
    "use server"
    return actionHandler.deleteComponent(DeleteComponentSchema.parse(data))
  },
  deleteUser: async (data) => {
    "use server"
    return actionHandler.deleteUser(DeleteUserSchema.parse(data))
  },
  getAllImages: async (data) => {
    "use server"
    return actionHandler.getAllImages(GetAllImagesSchema.parse(data))
  },
  listComponents: async (data) => {
    "use server"
    return actionHandler.listComponents(ListComponentsSchema.parse(data))
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
  getComponent: async (data) => {
    "use server"
    return actionHandler.getComponent(GetComponentSchema.parse(data))
  },
  migrateData: async (data) => {
    "use server"
    return actionHandler.migrateData(MigrateDataSchema.parse(data))
  },
  publishComponent: async (data) => {
    "use server"
    return actionHandler.publishComponent(PublishComponentSchema.parse(data))
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

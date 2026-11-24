import {
  AddImageSchema,
  AddFragmentSchema,
  AddUserSchema,
  CanSchema,
  ChangeRoleSchema,
  DeleteImageSchema,
  DeleteFragmentSchema,
  DeleteUserSchema,
  GetAllImagesSchema,
  GetAllFragmentsSchema,
  GetAllPathsSchema,
  GetAllUsersSchema,
  GetConfigSchema,
  GetFragmentDataSchema,
  MigrateDataSchema,
  PublishFragmentSchema,
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
  addFragment: async (data) => {
    "use server"
    return actionHandler.addFragment(AddFragmentSchema.parse(data))
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
  deleteFragment: async (data) => {
    "use server"
    return actionHandler.deleteFragment(DeleteFragmentSchema.parse(data))
  },
  deleteUser: async (data) => {
    "use server"
    return actionHandler.deleteUser(DeleteUserSchema.parse(data))
  },
  getAllImages: async (data) => {
    "use server"
    return actionHandler.getAllImages(GetAllImagesSchema.parse(data))
  },
  getAllFragments: async (data) => {
    "use server"
    return actionHandler.getAllFragments(GetAllFragmentsSchema.parse(data))
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
  getFragmentData: async (data) => {
    "use server"
    return actionHandler.getFragmentData(GetFragmentDataSchema.parse(data))
  },
  migrateData: async (data) => {
    "use server"
    return actionHandler.migrateData(MigrateDataSchema.parse(data))
  },
  publishFragmentData: async (data) => {
    "use server"
    return actionHandler.publishFragmentData(PublishFragmentSchema.parse(data))
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

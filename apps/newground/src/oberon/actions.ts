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
  OberonClientContextRequestSchema,
  PublishComponentSchema,
  ResolvePathSchema,
  SignInSchema,
  SignOutSchema,
  type OberonServerActions,
} from "@oberoncms/core"
import { createActionHandler } from "@oberoncms/core/adapter"
import { getOberonClientContext } from "@oberoncms/core/provider"
import { createServerFn } from "@tanstack/react-start"

import { adapter } from "./adapter"

const actionHandler = createActionHandler(adapter)

const resolvePath = createServerFn({ method: "GET" })
  .validator(ResolvePathSchema)
  .handler(({ data }) => actionHandler.resolvePath(data))

// Keep loader and action transports together until https://github.com/TanStack/router/issues/7943 is fixed.
export const getCmsContext = createServerFn({ method: "GET" })
  .validator(OberonClientContextRequestSchema)
  .handler(({ data }) =>
    getOberonClientContext({
      adapter,
      path: data.path,
      searchParams: data.searchParams,
    }),
  )

const addImage = createServerFn({ method: "POST" })
  .validator(AddImageSchema)
  .handler(({ data }) => actionHandler.addImage(data))

const addComponent = createServerFn({ method: "POST" })
  .validator(AddComponentSchema)
  .handler(({ data }) => actionHandler.addComponent(data))

const addUser = createServerFn({ method: "POST" })
  .validator(AddUserSchema)
  .handler(({ data }) => actionHandler.addUser(data))

const can = createServerFn({ method: "POST" })
  .validator(CanSchema)
  .handler(({ data }) => actionHandler.can(data))

const changeRole = createServerFn({ method: "POST" })
  .validator(ChangeRoleSchema)
  .handler(({ data }) => actionHandler.changeRole(data))

const deleteImage = createServerFn({ method: "POST" })
  .validator(DeleteImageSchema)
  .handler(({ data }) => actionHandler.deleteImage(data))

const deleteComponent = createServerFn({ method: "POST" })
  .validator(DeleteComponentSchema)
  .handler(({ data }) => actionHandler.deleteComponent(data))

const deleteUser = createServerFn({ method: "POST" })
  .validator(DeleteUserSchema)
  .handler(({ data }) => actionHandler.deleteUser(data))

const getAllImages = createServerFn({ method: "GET" })
  .validator(GetAllImagesSchema)
  .handler(({ data }) => actionHandler.getAllImages(data))

const listComponents = createServerFn({ method: "GET" })
  .validator(ListComponentsSchema)
  .handler(({ data }) => actionHandler.listComponents(data))

const getAllPaths = createServerFn({ method: "GET" })
  .validator(GetAllPathsSchema)
  .handler(({ data }) => actionHandler.getAllPaths(data))

const getAllUsers = createServerFn({ method: "GET" })
  .validator(GetAllUsersSchema)
  .handler(({ data }) => actionHandler.getAllUsers(data))

const getConfig = createServerFn({ method: "GET" })
  .validator(GetConfigSchema)
  .handler(({ data }) => actionHandler.getConfig(data))

const getComponent = createServerFn({ method: "POST" })
  .validator(GetComponentSchema)
  .handler(({ data }) => actionHandler.getComponent(data))

const migrateData = createServerFn({ method: "POST" })
  .validator(MigrateDataSchema)
  .handler(({ data }) => actionHandler.migrateData(data))

const publishComponent = createServerFn({ method: "POST" })
  .validator(PublishComponentSchema)
  .handler(({ data }) => actionHandler.publishComponent(data))

const signIn = createServerFn({ method: "POST" })
  .validator(SignInSchema)
  .handler(({ data }) => actionHandler.signIn(data))

const signOut = createServerFn({ method: "POST" })
  .validator(SignOutSchema)
  .handler(({ data }) => actionHandler.signOut(data))

export const actions = {
  resolvePath: (data) => resolvePath({ data }),
  addImage: (data) => addImage({ data }),
  addComponent: (data) => addComponent({ data }),
  addUser: (data) => addUser({ data }),
  can: (data) => can({ data }),
  changeRole: (data) => changeRole({ data }),
  deleteImage: (data) => deleteImage({ data }),
  deleteComponent: (data) => deleteComponent({ data }),
  deleteUser: (data) => deleteUser({ data }),
  getAllImages: (data) => getAllImages({ data }),
  listComponents: (data) => listComponents({ data }),
  getAllPaths: (data) => getAllPaths({ data }),
  getAllUsers: (data) => getAllUsers({ data }),
  getConfig: (data) => getConfig({ data }),
  getComponent: (data) => getComponent({ data }),
  migrateData: (data) => migrateData({ data }),
  publishComponent: (data) => publishComponent({ data }),
  signIn: (data) => signIn({ data }),
  signOut: (data) => signOut({ data }),
} satisfies OberonServerActions

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
import { createServerFn } from "@tanstack/react-start"

import { actionHandler } from "./adapter"

const addImage = createServerFn({ method: "POST" })
  .validator(AddImageSchema)
  .handler(({ data }) => actionHandler.addImage(data))

const addPage = createServerFn({ method: "POST" })
  .validator(AddPageSchema)
  .handler(({ data }) => actionHandler.addPage(data))

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

const deletePage = createServerFn({ method: "POST" })
  .validator(DeletePageSchema)
  .handler(({ data }) => actionHandler.deletePage(data))

const deleteUser = createServerFn({ method: "POST" })
  .validator(DeleteUserSchema)
  .handler(({ data }) => actionHandler.deleteUser(data))

const getAllImages = createServerFn({ method: "GET" })
  .validator(GetAllImagesSchema)
  .handler(({ data }) => actionHandler.getAllImages(data))

const getAllPages = createServerFn({ method: "GET" })
  .validator(GetAllPagesSchema)
  .handler(({ data }) => actionHandler.getAllPages(data))

const getAllPaths = createServerFn({ method: "GET" })
  .validator(GetAllPathsSchema)
  .handler(({ data }) => actionHandler.getAllPaths(data))

const getAllUsers = createServerFn({ method: "GET" })
  .validator(GetAllUsersSchema)
  .handler(({ data }) => actionHandler.getAllUsers(data))

const getConfig = createServerFn({ method: "GET" })
  .validator(GetConfigSchema)
  .handler(({ data }) => actionHandler.getConfig(data))

const getPageData = createServerFn({ method: "POST" })
  .validator(GetPageDataSchema)
  .handler(({ data }) => actionHandler.getPageData(data))

const migrateData = createServerFn({ method: "POST" })
  .validator(MigrateDataSchema)
  .handler(({ data }) => actionHandler.migrateData(data))

const publishPageData = createServerFn({ method: "POST" })
  .validator(PublishPageSchema)
  .handler(({ data }) => actionHandler.publishPageData(data))

const signIn = createServerFn({ method: "POST" })
  .validator(SignInSchema)
  .handler(({ data }) => actionHandler.signIn(data))

const signOut = createServerFn({ method: "POST" })
  .validator(SignOutSchema)
  .handler(({ data }) => actionHandler.signOut(data))

export const actions = {
  addImage: (data) => addImage({ data }),
  addPage: (data) => addPage({ data }),
  addUser: (data) => addUser({ data }),
  can: (data) => can({ data }),
  changeRole: (data) => changeRole({ data }),
  deleteImage: (data) => deleteImage({ data }),
  deletePage: (data) => deletePage({ data }),
  deleteUser: (data) => deleteUser({ data }),
  getAllImages: (data) => getAllImages({ data }),
  getAllPages: (data) => getAllPages({ data }),
  getAllPaths: (data) => getAllPaths({ data }),
  getAllUsers: (data) => getAllUsers({ data }),
  getConfig: (data) => getConfig({ data }),
  getPageData: (data) => getPageData({ data }),
  migrateData: (data) => migrateData({ data }),
  publishPageData: (data) => publishPageData({ data }),
  signIn: (data) => signIn({ data }),
  signOut: (data) => signOut({ data }),
} satisfies OberonServerActions

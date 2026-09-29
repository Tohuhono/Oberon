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
import { createServerFn } from "@tanstack/react-start"

import { actionHandler } from "./adapter"

type ActionInput<TAction extends keyof OberonServerActions> = Parameters<
  OberonServerActions[TAction]
>[0]

function passThrough<T>(data: T) {
  return data
}

/*
       addImage: invalidateAfter(serverActions.addImage),
        addPage: invalidateAfter(serverActions.addPage),
        addUser: invalidateAfter(serverActions.addUser),
        changeRole: invalidateAfter(serverActions.changeRole),
        deleteImage: invalidateAfter(serverActions.deleteImage),
        deletePage: invalidateAfter(serverActions.deletePage),
        deleteUser: invalidateAfter(serverActions.deleteUser),
        publishPageData: invalidateAfter(serverActions.publishPageData),
*/

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

const getAllImages = createServerFn({ method: "GET" }).handler(actionHandler.getAllImages)

const getAllPages = createServerFn({ method: "GET" }).handler(actionHandler.getAllPages)

const getAllPaths = createServerFn({ method: "GET" }).handler(actionHandler.getAllPaths)

const getAllUsers = createServerFn({ method: "GET" }).handler(actionHandler.getAllUsers)

const getConfig = createServerFn({ method: "GET" }).handler(actionHandler.getConfig)

const getPageData = createServerFn({ method: "POST" })
  .validator(DeletePageSchema)
  .handler(({ data }) => actionHandler.getPageData(data))

const migrateData = createServerFn({ method: "POST" }).handler(actionHandler.migrateData)

const publishPageData = createServerFn({ method: "POST" })
  .validator(PublishPageSchema)
  .handler(({ data }) => actionHandler.publishPageData(data))

const signIn = createServerFn({ method: "POST" })
  .validator(passThrough<ActionInput<"signIn">>)
  .handler(({ data }) => actionHandler.signIn(data))

const signOut = createServerFn({ method: "POST" }).handler(actionHandler.signOut)

export const actions = {
  addImage: (data) => addImage({ data }),
  addPage: (data) => addPage({ data }),
  addUser: (data) => addUser({ data }),
  can: (data) => can({ data }),
  changeRole: (data) => changeRole({ data }),
  deleteImage: (data) => deleteImage({ data }),
  deletePage: (data) => deletePage({ data }),
  deleteUser: (data) => deleteUser({ data }),
  getAllImages,
  getAllPages,
  getAllPaths,
  getAllUsers,
  getConfig,
  getPageData: (data) => getPageData({ data }),
  migrateData,
  publishPageData: (data) => publishPageData({ data }),
  signIn: (data) => signIn({ data }),
  signOut,
} satisfies OberonServerActions

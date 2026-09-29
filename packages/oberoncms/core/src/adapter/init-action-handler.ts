import {
  INITIAL_DATA,
  ResponseError,
  type AdapterActionGroup,
  type AdapterPermission,
  type OberonAdapter,
  type OberonPage,
  type OberonResponse,
  type OberonServerActions,
} from "../lib/dtd"

export async function transport<T>(
  promise: Promise<T>,
  options: { successMessage?: string | ((result: T) => string | undefined) } = {},
): OberonResponse<T> {
  try {
    const result = await promise
    const message =
      typeof options.successMessage === "function"
        ? options.successMessage(result)
        : options.successMessage

    return {
      status: "success",
      message,
      result,
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      return {
        status: "error",
        message: error.message,
      }
    }
    console.error(error)
    return {
      status: "error",
      message: "An unexpected error occured",
    }
  }
}

export function initActionHandler(adapter: OberonAdapter): OberonServerActions {
  const will = async (action: AdapterActionGroup, permission: AdapterPermission) => {
    if (!(await adapter.can(action, permission))) {
      throw new ResponseError("You do not have permission to perform this action")
    }
  }

  const whoWill = async (action: AdapterActionGroup, permission: AdapterPermission) => {
    const user = await adapter.getCurrentUser()

    if (user && adapter.hasPermission({ user, action, permission })) {
      return user
    }
    throw new ResponseError("You do not have permission to perform this action")
  }

  return {
    addPage: (data) =>
      transport(
        (async () => {
          const user = await whoWill("pages", "write")
          const { key } = data
          await adapter.addPage({
            key,
            data: INITIAL_DATA,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
        })(),
      ),
    addImage: (data) =>
      transport(
        (async () => {
          await will("images", "write")
          await adapter.addImage(data)
          return adapter.getAllImages()
        })(),
      ),
    addUser: (data) =>
      transport(
        (async () => {
          await will("users", "write")
          const { email, role } = data
          const { id } = await adapter.addUser({ email, role })
          return { id, email, role }
        })(),
      ),
    deletePage: (data) =>
      transport(
        (async () => {
          await will("pages", "write")
          await adapter.deletePage(data.key)
        })(),
      ),
    deleteImage: (key) =>
      transport(
        (async () => {
          await will("images", "write")
          await adapter.deleteImage(key)
        })(),
      ),
    deleteUser: (data) =>
      transport(
        (async () => {
          await will("users", "write")
          const { id } = data
          await adapter.deleteUser(id)
          return { id }
        })(),
      ),
    can: (action, permission) => transport(adapter.can(action, permission)),
    changeRole: (data) =>
      transport(
        (async () => {
          await will("users", "write")
          const { role, id } = data
          await adapter.changeRole({ role, id })
          return { role, id }
        })(),
      ),
    getAllImages: () => transport(will("images", "read").then(() => adapter.getAllImages())),
    getAllPages: () => transport(will("pages", "read").then(() => adapter.getAllPages())),
    getAllPaths: () => transport(will("pages", "read").then(() => adapter.getAllPaths())),
    getAllUsers: () => transport(will("users", "read").then(() => adapter.getAllUsers())),
    getConfig: () => transport(will("site", "read").then(() => adapter.getConfig())),
    getPageData: (key) => transport(will("pages", "read").then(() => adapter.getPageData(key))),
    migrateData: () =>
      transport(whoWill("site", "write").then((user) => adapter.migrateData(user))),
    publishPageData: (data) =>
      transport(
        (async () => {
          const user = await whoWill("pages", "write")
          const { key, data: pageData } = data

          if (!isPageData(pageData)) {
            throw new ResponseError("Invalid page data")
          }

          await adapter.updatePageData({
            key,
            data: pageData,
            updatedAt: new Date(),
            updatedBy: user.email,
          })
          return { key }
        })(),
        {
          successMessage: ({ key }) => `Successfully published ${key}`,
        },
      ),
    signIn: (data) => transport(adapter.signIn(data)),
    signOut: () => transport(adapter.signOut()),
  }
}

function isPageData(value: unknown): value is OberonPage["data"] {
  return typeof value === "object" && value !== null && "content" in value && "root" in value
}

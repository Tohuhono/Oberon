import {
  INITIAL_DATA,
  ResponseError,
  type OberonAdapter,
  type OberonPage,
  type OberonResponse,
  type OberonServerActions,
} from "../lib/dtd"

export async function transport<T>(
  action: () => Promise<T>,
  options: { successMessage?: string | ((result: T) => string | undefined) } = {},
): OberonResponse<T> {
  try {
    const result = await action()
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
  return {
    addPage: (data) =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "pages", permission: "write" })
        const { key } = data
        await adapter.addPage({
          key,
          data: INITIAL_DATA,
          updatedAt: new Date(),
          updatedBy: user.email,
        })
      }),
    addImage: (data) =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "write" })
        await adapter.addImage(data)
        return adapter.getAllImages()
      }),
    addUser: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { email, role } = data
        const { id } = await adapter.addUser({ email, role })
        return { id, email, role }
      }),
    deletePage: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "write" })
        await adapter.deletePage(data)
      }),
    deleteImage: (data) =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "write" })
        await adapter.deleteImage(data)
      }),
    deleteUser: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { id } = data
        await adapter.deleteUser(data)
        return { id }
      }),
    can: (data) => transport(() => adapter.can(data)),
    changeRole: (data) =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "write" })
        const { role, id } = data
        await adapter.changeRole({ role, id })
        return { role, id }
      }),
    getAllImages: () =>
      transport(async () => {
        await adapter.will({ action: "images", permission: "read" })
        return adapter.getAllImages()
      }),
    getAllPages: () =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getAllPages()
      }),
    getAllPaths: () =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getAllPaths()
      }),
    getAllUsers: () =>
      transport(async () => {
        await adapter.will({ action: "users", permission: "read" })
        return adapter.getAllUsers()
      }),
    getConfig: () =>
      transport(async () => {
        await adapter.will({ action: "site", permission: "read" })
        return adapter.getConfig()
      }),
    getPageData: (data) =>
      transport(async () => {
        await adapter.will({ action: "pages", permission: "read" })
        return adapter.getPageData(data)
      }),
    migrateData: () =>
      transport(async () => {
        const user = await adapter.whoWill({ action: "site", permission: "write" })
        return adapter.migrateData(user)
      }),
    publishPageData: (data) =>
      transport(
        async () => {
          const user = await adapter.whoWill({ action: "pages", permission: "write" })
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
        },
        {
          successMessage: ({ key }) => `Successfully published ${key}`,
        },
      ),
    signIn: (data) => transport(() => adapter.signIn(data)),
    signOut: () => transport(() => adapter.signOut()),
  }
}

function isPageData(value: unknown): value is OberonPage["data"] {
  return typeof value === "object" && value !== null && "content" in value && "root" in value
}

import {
  ResponseError,
  type OberonAdapter,
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
  return {
    addPage: (page) => transport(adapter.addPage(page)),
    addImage: (data) => transport(adapter.addImage(data)),
    addUser: (data) => transport(adapter.addUser(data)),
    deletePage: (data) => transport(adapter.deletePage(data)),
    deleteImage: (key) => transport(adapter.deleteImage(key)),
    deleteUser: (data) => transport(adapter.deleteUser(data)),
    can: (action, permission) => transport(adapter.can(action, permission)),
    changeRole: (data) => transport(adapter.changeRole(data)),
    getAllImages: () => transport(adapter.getAllImages()),
    getAllPages: () => transport(adapter.getAllPages()),
    getAllPaths: () => transport(adapter.getAllPaths()),
    getAllUsers: () => transport(adapter.getAllUsers()),
    getConfig: () => transport(adapter.getConfig()),
    getPageData: (key) => transport(adapter.getPageData(key)),
    migrateData: () => transport(adapter.migrateData()),
    publishPageData: (data) =>
      transport(adapter.publishPageData(data), {
        successMessage: ({ key }) => `Successfully published ${key}`,
      }),
    signIn: (data) => transport(adapter.signIn(data)),
    signOut: () => transport(adapter.signOut()),
  }
}

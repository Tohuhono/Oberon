import {
  OberonError,
  ResponseError,
  type OberonActionSurface,
  type OberonActionTransport,
  type OberonAdapter,
  type OberonResponse,
} from "../lib/dtd"

export async function defaultTransport<T>(promise: Promise<T>): OberonResponse<T> {
  try {
    return {
      status: "success",
      result: await promise,
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      return {
        status: "error",
        message: error.message,
      }
    }
    if (error instanceof OberonError) {
      console.error(error)
      return {
        status: "error",
        message: "An unexpected error occurred",
      }
    }
    throw error
  }
}

function createOberonActions(
  adapter: OberonAdapter,
  transport: OberonActionTransport = defaultTransport,
): OberonActionSurface {
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
    publishPageData: (data) => transport(adapter.publishPageData(data)),
    signIn: (data) => transport(adapter.signIn(data)),
    signOut: () => transport(adapter.signOut()),
  }
}

export function initActionHandler(adapter: OberonAdapter): OberonActionSurface {
  const actions = createOberonActions(adapter)

  return actions
}

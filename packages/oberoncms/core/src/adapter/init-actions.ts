import {
  type OberonActionSurface,
  type OberonActionTransport,
  type OberonAdapter,
  type OberonPluginActionProvider,
} from "../lib/dtd"
import { wrap } from "../lib/utils"

export function createOberonActions(
  adapter: OberonAdapter,
  transport: OberonActionTransport = wrap,
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

export function initActions(
  adapter: OberonAdapter,
  actionProviders: OberonPluginActionProvider[],
): OberonActionSurface {
  const actions = createOberonActions(adapter)

  return actionProviders.reduce<OberonActionSurface>((accumulator, provider) => {
    return {
      ...accumulator,
      ...provider(accumulator, adapter),
    }
  }, actions)
}

import {
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPermissions,
  type PluginVersion,
  type OberonHandler,
} from "../lib/dtd"
import { notImplemented } from "../lib/utils"
import { getInitialData } from "./get-initial-data"

type InititalisedPlugins = {
  adapter: OberonPluginAdapter
  handlers: Record<string, OberonHandler>
  versions: PluginVersion[]
}

export const baseAccumulator: InititalisedPlugins = {
  handlers: {},
  versions: [],
  adapter: {
    prebuild: async () => {},
    getCurrentUser: notImplemented("getCurrentUser"),
    hasPermission: ({ user, action, permission }) => {
      const permissions: OberonPermissions = {
        unauthenticated: {
          pages: "read",
        },
        user: {
          site: "read",
          pages: "write",
          images: "write",
        },
      }
      const role = user?.role || ("unauthenticated" as const)

      if (role === "admin") {
        return true
      }
      return (
        permissions[role][action] === permission ||
        permissions[role][action] === "write"
      )
    },
    signIn: notImplemented("signIn"),
    signOut: notImplemented("signOut"),
    // OberonSendAdapter
    sendVerificationRequest: notImplemented("sendVerificationRequest"),
    // OberonBaseAdapter
    addImage: notImplemented("addImage"),
    addPage: notImplemented("addPage"),
    addUser: notImplemented("addUser"),
    changeRole: notImplemented("changeRole"),
    deleteImage: notImplemented("deleteImage"),
    deletePage: notImplemented("deletePage"),
    deleteUser: notImplemented("deleteUser"),
    getAllImages: notImplemented("getAllImages"),
    getAllPages: notImplemented("getAllPages"),
    getAllUsers: notImplemented("getAllUsers"),
    getPageData: notImplemented("getPageData"),
    getSite: notImplemented("getSite"),
    updatePageData: notImplemented("updatePageData"),
    updateSite: notImplemented("updateSite"),
    // OberonAuthAdapter
    createSession: notImplemented("createSession"),
    createUser: notImplemented("createUser"),
    createVerificationToken: notImplemented("createVerificationToken"),
    deleteSession: notImplemented("deleteSession"),
    // deleteUser // duplicate
    getSessionAndUser: notImplemented("getSessionAndUser"),
    getUser: notImplemented("getUser"),
    getUserByAccount: notImplemented("getUserByAccount"),
    getUserByEmail: notImplemented("getUserByEmail"),
    linkAccount: notImplemented("linkAccount"),
    unlinkAccount: notImplemented("unlinkAccount"),
    useVerificationToken: notImplemented("useVerificationToken"),
    updateSession: notImplemented("updateSession"),
    updateUser: notImplemented("updateUser"),
  } satisfies OberonPluginAdapter,
}

export function initPlugins(plugins: OberonPlugin[] = []) {
  const oberon: InititalisedPlugins = plugins.reduce<InititalisedPlugins>(
    (accumulator, plugin) => {
      const {
        name,
        version,
        disabled,
        adapter,
        handlers = {},
      } = plugin(accumulator.adapter)

      if (disabled) {
        return {
          ...accumulator,
          versions: [
            ...accumulator.versions,
            { name, disabled, version: version || "" },
          ],
        }
      }

      return {
        versions: [
          ...accumulator.versions,
          { name, disabled, version: version || "" },
        ],
        handlers: {
          ...accumulator.handlers,
          ...handlers,
        },
        adapter: {
          ...accumulator.adapter,
          ...adapter,
        },
      } satisfies InititalisedPlugins
    },
    baseAccumulator,
  )

  return {
    ...oberon,
    adapter: {
      ...oberon.adapter,
      prebuild: async () => {
        await oberon.adapter.prebuild()
        const allPages = await oberon.adapter.getAllPages()
        if (!allPages.length) {
          console.log("Initialising welcome page")
          await oberon.adapter.updatePageData(getInitialData())
        }
      },
    },
  } satisfies InititalisedPlugins
}

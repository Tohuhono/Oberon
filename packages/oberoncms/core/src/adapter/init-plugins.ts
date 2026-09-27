import {
  type OberonAdapter,
  type OberonClientConfig,
  type OberonHandler,
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPluginAdapterHook,
  type OberonPluginPhase,
  type OberonPermissions,
  type PluginVersion,
} from "../lib/dtd"
import { getInitialData } from "./get-initial-data"
import { stubbedAdapter } from "./stubbed-adapter"
import { getComponentTransformVersions } from "./transforms"

type InitialisedPlugins = {
  adapter: OberonPluginAdapter
  bootstrap: () => Promise<void>
  handlers: Record<
    string,
    (context: { adapter: OberonAdapter; pluginAdapter: OberonPluginAdapter }) => OberonHandler
  >
  versions: PluginVersion[]
}

function getBaseAdapter(): OberonPluginAdapter {
  return {
    ...stubbedAdapter,
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
        admin: {
          all: "write",
        },
      }
      const role = user?.role || ("unauthenticated" as const)

      if (role === "admin") {
        return true
      }
      return !!(
        permissions[role] &&
        permissions[role][action] &&
        (permissions[role][action] === permission ||
          permissions[role][action] === "write" ||
          permissions[role].all === permission ||
          permissions[role].all === "write")
      )
    },
  }
}

function composeAdapterHook<Key extends keyof OberonPluginAdapter>(
  hooks: Array<OberonPluginAdapterHook<Key> | undefined>,
  adapter: OberonPluginAdapter,
  fallback: OberonPluginAdapter[Key],
): OberonPluginAdapter[Key] {
  return hooks.reduce<OberonPluginAdapter[Key]>((next, hook) => {
    return hook ? hook({ adapter, next }) : next
  }, fallback)
}

function composeAdapter(plugins: ReturnType<OberonPlugin>[]): OberonPluginAdapter {
  const baseAdapter = getBaseAdapter()
  let implementation = baseAdapter

  // Unlike the previous progressively accumulated adapter, this stable forwarding object lets
  // every hook close over the final composition while `next` retains the preceding implementation.
  const adapter: OberonPluginAdapter = {
    getCurrentUser: () => implementation.getCurrentUser(),
    hasPermission: (props) => implementation.hasPermission(props),
    signIn: (data) => implementation.signIn(data),
    signOut: () => implementation.signOut(),
    redirect: (href) => implementation.redirect(href),
    notFound: () => implementation.notFound(),
    getRequestHeaders: () => implementation.getRequestHeaders(),
    getAuthDatabase: () => implementation.getAuthDatabase(),
    getAuthPlugins: () => implementation.getAuthPlugins(),
    addPage: (page) => implementation.addPage(page),
    addImage: (image) => implementation.addImage(image),
    deletePage: (key) => implementation.deletePage(key),
    deleteImage: (key) => implementation.deleteImage(key),
    deleteKV: (namespace, key) => implementation.deleteKV(namespace, key),
    getAllImages: () => implementation.getAllImages(),
    getAllPages: () => implementation.getAllPages(),
    getPageData: (key) => implementation.getPageData(key),
    getKV: (namespace, key) => implementation.getKV(namespace, key),
    getSite: () => implementation.getSite(),
    putKV: (namespace, key, value) => implementation.putKV(namespace, key, value),
    updatePageData: (page) => implementation.updatePageData(page),
    updateSite: (site) => implementation.updateSite(site),
    addUser: (user) => implementation.addUser(user),
    deleteUser: (id) => implementation.deleteUser(id),
    changeRole: (data) => implementation.changeRole(data),
    getAllUsers: () => implementation.getAllUsers(),
    sendVerificationRequest: (props) => implementation.sendVerificationRequest(props),
  }

  implementation = {
    getCurrentUser: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getCurrentUser),
      adapter,
      baseAdapter.getCurrentUser,
    ),
    hasPermission: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.hasPermission),
      adapter,
      baseAdapter.hasPermission,
    ),
    signIn: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.signIn),
      adapter,
      baseAdapter.signIn,
    ),
    signOut: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.signOut),
      adapter,
      baseAdapter.signOut,
    ),
    redirect: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.redirect),
      adapter,
      baseAdapter.redirect,
    ),
    notFound: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.notFound),
      adapter,
      baseAdapter.notFound,
    ),
    getRequestHeaders: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getRequestHeaders),
      adapter,
      baseAdapter.getRequestHeaders,
    ),
    getAuthDatabase: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getAuthDatabase),
      adapter,
      baseAdapter.getAuthDatabase,
    ),
    getAuthPlugins: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getAuthPlugins),
      adapter,
      baseAdapter.getAuthPlugins,
    ),
    addPage: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.addPage),
      adapter,
      baseAdapter.addPage,
    ),
    addImage: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.addImage),
      adapter,
      baseAdapter.addImage,
    ),
    deletePage: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.deletePage),
      adapter,
      baseAdapter.deletePage,
    ),
    deleteImage: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.deleteImage),
      adapter,
      baseAdapter.deleteImage,
    ),
    deleteKV: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.deleteKV),
      adapter,
      baseAdapter.deleteKV,
    ),
    getAllImages: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getAllImages),
      adapter,
      baseAdapter.getAllImages,
    ),
    getAllPages: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getAllPages),
      adapter,
      baseAdapter.getAllPages,
    ),
    getPageData: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getPageData),
      adapter,
      baseAdapter.getPageData,
    ),
    getKV: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getKV),
      adapter,
      baseAdapter.getKV,
    ),
    getSite: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getSite),
      adapter,
      baseAdapter.getSite,
    ),
    putKV: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.putKV),
      adapter,
      baseAdapter.putKV,
    ),
    updatePageData: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.updatePageData),
      adapter,
      baseAdapter.updatePageData,
    ),
    updateSite: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.updateSite),
      adapter,
      baseAdapter.updateSite,
    ),
    addUser: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.addUser),
      adapter,
      baseAdapter.addUser,
    ),
    deleteUser: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.deleteUser),
      adapter,
      baseAdapter.deleteUser,
    ),
    changeRole: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.changeRole),
      adapter,
      baseAdapter.changeRole,
    ),
    getAllUsers: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.getAllUsers),
      adapter,
      baseAdapter.getAllUsers,
    ),
    sendVerificationRequest: composeAdapterHook(
      plugins.map((plugin) => plugin.adapter?.sendVerificationRequest),
      adapter,
      baseAdapter.sendVerificationRequest,
    ),
  }

  return adapter
}

export function initPlugins(
  plugins: OberonPlugin[] = [],
  { config, phase = "runtime" }: { config?: OberonClientConfig; phase?: OberonPluginPhase } = {},
) {
  const definitions = plugins.map((plugin) => plugin({ phase }))
  const enabledPlugins = definitions.filter(({ disabled }) => !disabled)
  const adapter = composeAdapter(enabledPlugins)
  const handlers = enabledPlugins.reduce<InitialisedPlugins["handlers"]>(
    (accumulator, plugin) => ({
      ...accumulator,
      ...(phase === "runtime" ? plugin.handlers : {}),
    }),
    {},
  )
  const versions = definitions.map(({ name, disabled, version }) => ({
    name,
    disabled,
    version: version || "",
  }))

  return {
    adapter,
    handlers,
    versions,
    bootstrap: async () => {
      for (const plugin of enabledPlugins) {
        await plugin.bootstrap?.({ adapter })
      }

      const allPages = await adapter.getAllPages()
      if (!allPages.length) {
        console.log("Initialising welcome page")
        await adapter.updatePageData(getInitialData())
      }

      const site = await adapter.getSite()
      if (!site && config) {
        await adapter.updateSite({
          version: config.version,
          components: getComponentTransformVersions(config),
          updatedAt: new Date(),
          updatedBy: "system",
        })
      }
    },
  } satisfies InitialisedPlugins
}

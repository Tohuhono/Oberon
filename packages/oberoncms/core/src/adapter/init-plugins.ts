import {
  type OberonAdapter,
  type OberonClientConfig,
  type OberonHandler,
  type OberonPlugin,
  type OberonPluginAdapter,
  type OberonPluginAdapterHook,
  type OberonPluginAdapterPayloads,
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

type SemanticAdapterMethod<Key extends keyof OberonPluginAdapter> = (
  payload: OberonPluginAdapterPayloads[Key],
) => ReturnType<OberonPluginAdapter[Key]>

function composeAdapterHook<Key extends keyof OberonPluginAdapter>(
  hooks: Array<OberonPluginAdapterHook<Key> | undefined>,
  getAdapter: () => OberonPluginAdapter,
  fallback: SemanticAdapterMethod<Key>,
): SemanticAdapterMethod<Key> {
  return hooks.reduce<SemanticAdapterMethod<Key>>((next, hook) => {
    return hook
      ? (payload) =>
          hook({
            adapter: getAdapter(),
            next,
            payload,
          })
      : next
  }, fallback)
}

function composeAdapter(plugins: ReturnType<OberonPlugin>[]): OberonPluginAdapter {
  const baseAdapter = getBaseAdapter()
  const getAdapter = () => adapter

  const getCurrentUser = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getCurrentUser),
    getAdapter,
    () => baseAdapter.getCurrentUser(),
  )
  const hasPermission = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.hasPermission),
    getAdapter,
    (payload) => baseAdapter.hasPermission(payload),
  )
  const signIn = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.signIn),
    getAdapter,
    (payload) => baseAdapter.signIn(payload),
  )
  const signOut = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.signOut),
    getAdapter,
    () => baseAdapter.signOut(),
  )
  const redirect = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.redirect),
    getAdapter,
    ({ href }) => baseAdapter.redirect(href),
  )
  const notFound = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.notFound),
    getAdapter,
    () => baseAdapter.notFound(),
  )
  const getRequestHeaders = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getRequestHeaders),
    getAdapter,
    () => baseAdapter.getRequestHeaders(),
  )
  const getAuthDatabase = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getAuthDatabase),
    getAdapter,
    () => baseAdapter.getAuthDatabase(),
  )
  const getAuthPlugins = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getAuthPlugins),
    getAdapter,
    () => baseAdapter.getAuthPlugins(),
  )
  const addPage = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.addPage),
    getAdapter,
    ({ page }) => baseAdapter.addPage(page),
  )
  const addImage = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.addImage),
    getAdapter,
    ({ image }) => baseAdapter.addImage(image),
  )
  const deletePage = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.deletePage),
    getAdapter,
    ({ key }) => baseAdapter.deletePage(key),
  )
  const deleteImage = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.deleteImage),
    getAdapter,
    ({ key }) => baseAdapter.deleteImage(key),
  )
  const deleteKV = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.deleteKV),
    getAdapter,
    ({ namespace, key }) => baseAdapter.deleteKV(namespace, key),
  )
  const getAllImages = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getAllImages),
    getAdapter,
    () => baseAdapter.getAllImages(),
  )
  const getAllPages = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getAllPages),
    getAdapter,
    () => baseAdapter.getAllPages(),
  )
  const getPageData = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getPageData),
    getAdapter,
    ({ key }) => baseAdapter.getPageData(key),
  )
  const getKV = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getKV),
    getAdapter,
    ({ namespace, key }) => baseAdapter.getKV(namespace, key),
  )
  const getSite = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getSite),
    getAdapter,
    () => baseAdapter.getSite(),
  )
  const putKV = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.putKV),
    getAdapter,
    ({ namespace, key, value }) => baseAdapter.putKV(namespace, key, value),
  )
  const updatePageData = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.updatePageData),
    getAdapter,
    ({ page }) => baseAdapter.updatePageData(page),
  )
  const updateSite = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.updateSite),
    getAdapter,
    ({ site }) => baseAdapter.updateSite(site),
  )
  const addUser = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.addUser),
    getAdapter,
    ({ user }) => baseAdapter.addUser(user),
  )
  const deleteUser = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.deleteUser),
    getAdapter,
    ({ id }) => baseAdapter.deleteUser(id),
  )
  const changeRole = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.changeRole),
    getAdapter,
    (payload) => baseAdapter.changeRole(payload),
  )
  const getAllUsers = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.getAllUsers),
    getAdapter,
    () => baseAdapter.getAllUsers(),
  )
  const sendVerificationRequest = composeAdapterHook(
    plugins.map((plugin) => plugin.adapter?.sendVerificationRequest),
    getAdapter,
    (payload) => baseAdapter.sendVerificationRequest(payload),
  )

  const adapter: OberonPluginAdapter = {
    getCurrentUser: () => getCurrentUser({}),
    hasPermission: (payload) => hasPermission(payload),
    signIn: (payload) => signIn(payload),
    signOut: () => signOut({}),
    redirect: (href) => redirect({ href }),
    notFound: () => notFound({}),
    getRequestHeaders: () => getRequestHeaders({}),
    getAuthDatabase: () => getAuthDatabase({}),
    getAuthPlugins: () => getAuthPlugins({}),
    addPage: (page) => addPage({ page }),
    addImage: (image) => addImage({ image }),
    deletePage: (key) => deletePage({ key }),
    deleteImage: (key) => deleteImage({ key }),
    deleteKV: (namespace, key) => deleteKV({ namespace, key }),
    getAllImages: () => getAllImages({}),
    getAllPages: () => getAllPages({}),
    getPageData: (key) => getPageData({ key }),
    getKV: (namespace, key) => getKV({ namespace, key }),
    getSite: () => getSite({}),
    putKV: (namespace, key, value) => putKV({ namespace, key, value }),
    updatePageData: (page) => updatePageData({ page }),
    updateSite: (site) => updateSite({ site }),
    addUser: (user) => addUser({ user }),
    deleteUser: (id) => deleteUser({ id }),
    changeRole: (payload) => changeRole(payload),
    getAllUsers: () => getAllUsers({}),
    sendVerificationRequest: (payload) => sendVerificationRequest(payload),
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

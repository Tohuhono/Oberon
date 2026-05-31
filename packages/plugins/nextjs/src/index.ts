import { type OberonPlugin } from "@oberoncms/core"
import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"

import { name, version } from "../package.json" with { type: "json" }

export const plugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    updatePageData: async (data) => {
      await adapter.updatePageData(data)
      revalidatePath(data.key)
      updateTag("oberon-pages")
    },
    addPage: async (data) => {
      await adapter.addPage(data)
      revalidatePath(data.key)
      updateTag("oberon-pages")
    },
    deletePage: async (key) => {
      await adapter.deletePage(key)
      revalidatePath(key)
      updateTag("oberon-pages")
    },
    updateSite: async (data) => {
      adapter.updateSite(data)
      updateTag("oberon-config")
    },
    addImage: async (data) => {
      await adapter.addImage(data)
      updateTag("oberon-images")
    },
    deleteImage: async (data) => {
      await adapter.deleteImage(data)
      updateTag("oberon-images")
    },
    addUser: async (data) => {
      const user = await adapter.addUser(data)
      updateTag("oberon-users")
      return user
    },
    deleteUser: async (data) => {
      await adapter.deleteUser(data)
      updateTag("oberon-users")
    },
    changeRole: async (data) => {
      await adapter.changeRole(data)
      updateTag("oberon-users")
    },
    getPageData: cache(adapter.getPageData),
    getAllPages: cache(adapter.getAllPages, undefined, { tags: ["oberon-pages"] }),
    getAllUsers: cache(adapter.getAllUsers, undefined, {
      tags: ["oberon-users"],
    }),
    getAllImages: cache(adapter.getAllImages, undefined, { tags: ["oberon-images"] }),
    getSite: cache(adapter.getSite, undefined, { tags: ["oberon-config"] }),
  },
})

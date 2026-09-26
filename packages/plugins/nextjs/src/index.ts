import { type OberonPlugin, type OberonPluginAdapter } from "@oberoncms/core"
import { nextCookies } from "better-auth/next-js"
import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { name, version } from "../package.json" with { type: "json" }

export const plugin: OberonPlugin = ({ phase }) => {
  let getAllImages: OberonPluginAdapter["getAllImages"] | undefined
  let getAllPages: OberonPluginAdapter["getAllPages"] | undefined
  let getAllUsers: OberonPluginAdapter["getAllUsers"] | undefined
  let getPageData: OberonPluginAdapter["getPageData"] | undefined
  let getSite: OberonPluginAdapter["getSite"] | undefined

  return {
    name,
    version,
    adapter:
      phase === "runtime"
        ? {
            redirect: ({ payload: { href } }) => redirect(href),
            notFound: () => notFound(),
            getRequestHeaders: async () => new Headers(await headers()),
            getAuthPlugins: ({ next }) => [...next({}), nextCookies()],
            updatePageData: async ({ next, payload: { page } }) => {
              await next({ page })
              revalidatePath(page.key)
              updateTag("oberon-pages")
            },
            addPage: async ({ next, payload: { page } }) => {
              await next({ page })
              revalidatePath(page.key)
              updateTag("oberon-pages")
            },
            deletePage: async ({ next, payload: { key } }) => {
              await next({ key })
              revalidatePath(key)
              updateTag("oberon-pages")
            },
            updateSite: async ({ next, payload: { site } }) => {
              await next({ site })
              updateTag("oberon-config")
            },
            addImage: async ({ next, payload: { image } }) => {
              await next({ image })
              updateTag("oberon-images")
            },
            deleteImage: async ({ next, payload: { key } }) => {
              await next({ key })
              updateTag("oberon-images")
            },
            addUser: async ({ next, payload: { user } }) => {
              const createdUser = await next({ user })
              updateTag("oberon-users")
              return createdUser
            },
            deleteUser: async ({ next, payload: { id } }) => {
              await next({ id })
              updateTag("oberon-users")
            },
            changeRole: async ({ next, payload }) => {
              await next(payload)
              updateTag("oberon-users")
            },
            getPageData: ({ next, payload }) => {
              getPageData ??= cache((key) => next({ key }), ["oberon-get-page-data"])
              return getPageData(payload.key)
            },
            getAllPages: ({ next }) => {
              getAllPages ??= cache(() => next({}), ["oberon-get-all-pages"], {
                tags: ["oberon-pages"],
              })
              return getAllPages()
            },
            getAllUsers: ({ next }) => {
              getAllUsers ??= cache(() => next({}), ["oberon-get-all-users"], {
                tags: ["oberon-users"],
              })
              return getAllUsers()
            },
            getAllImages: ({ next }) => {
              getAllImages ??= cache(() => next({}), ["oberon-get-all-images"], {
                tags: ["oberon-images"],
              })
              return getAllImages()
            },
            getSite: ({ next }) => {
              getSite ??= cache(() => next({}), ["oberon-get-site"], {
                tags: ["oberon-config"],
              })
              return getSite()
            },
          }
        : {},
  }
}

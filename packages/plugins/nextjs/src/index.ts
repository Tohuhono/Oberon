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
            redirect: () => (href) => redirect(href),
            notFound: () => () => notFound(),
            getRequestHeaders: () => async () => new Headers(await headers()),
            getAuthPlugins:
              ({ next }) =>
              () => [...next(), nextCookies()],
            updatePageData:
              ({ next }) =>
              async (page) => {
                await next(page)
                revalidatePath(page.key)
                updateTag("oberon-pages")
              },
            addPage:
              ({ next }) =>
              async (page) => {
                await next(page)
                revalidatePath(page.key)
                updateTag("oberon-pages")
              },
            deletePage:
              ({ next }) =>
              async (key) => {
                await next(key)
                revalidatePath(key)
                updateTag("oberon-pages")
              },
            updateSite:
              ({ next }) =>
              async (site) => {
                await next(site)
                updateTag("oberon-config")
              },
            addImage:
              ({ next }) =>
              async (image) => {
                await next(image)
                updateTag("oberon-images")
              },
            deleteImage:
              ({ next }) =>
              async (key) => {
                await next(key)
                updateTag("oberon-images")
              },
            addUser:
              ({ next }) =>
              async (user) => {
                const createdUser = await next(user)
                updateTag("oberon-users")
                return createdUser
              },
            deleteUser:
              ({ next }) =>
              async (id) => {
                await next(id)
                updateTag("oberon-users")
              },
            changeRole:
              ({ next }) =>
              async (data) => {
                await next(data)
                updateTag("oberon-users")
              },
            getPageData:
              ({ next }) =>
              (key) => {
                getPageData ??= cache((key) => next(key), ["oberon-get-page-data"])
                return getPageData(key)
              },
            getAllPages:
              ({ next }) =>
              () => {
                getAllPages ??= cache(() => next(), ["oberon-get-all-pages"], {
                  tags: ["oberon-pages"],
                })
                return getAllPages()
              },
            getAllUsers:
              ({ next }) =>
              () => {
                getAllUsers ??= cache(() => next(), ["oberon-get-all-users"], {
                  tags: ["oberon-users"],
                })
                return getAllUsers()
              },
            getAllImages:
              ({ next }) =>
              () => {
                getAllImages ??= cache(() => next(), ["oberon-get-all-images"], {
                  tags: ["oberon-images"],
                })
                return getAllImages()
              },
            getSite:
              ({ next }) =>
              () => {
                getSite ??= cache(() => next(), ["oberon-get-site"], {
                  tags: ["oberon-config"],
                })
                return getSite()
              },
          }
        : {},
  }
}

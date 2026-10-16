import { type OberonPlugin } from "@oberoncms/core"
import { nextCookies } from "better-auth/next-js"
import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import { name, version } from "../package.json" with { type: "json" }

export { createRestHandler } from "./handler"

export const plugin: OberonPlugin = ({ phase }) => {
  return {
    name,
    version,
    adapter:
      phase === "runtime"
        ? {
            redirect:
              () =>
              ({ href }) =>
                redirect(href),
            notFound: () => notFound,
            getRequestHeaders: () => async () => {
              await connection()
              return headers()
            },
            getAuthPlugins:
              ({ next }) =>
              () => [...next(), nextCookies()],
            updatePageData:
              ({ next }) =>
              async (page) => {
                await next(page)
                revalidatePath(page.key)
                revalidatePath(`/cms/edit${page.key}`)
                revalidatePath(`/cms/preview${page.key}`)
                updateTag("oberon-pages")
              },
            addPage:
              ({ next }) =>
              async (page) => {
                await next(page)
                revalidatePath(page.key)
                revalidatePath(`/cms/edit${page.key}`)
                revalidatePath(`/cms/preview${page.key}`)
                updateTag("oberon-pages")
              },
            deletePage:
              ({ next }) =>
              async (data) => {
                await next(data)
                const { key } = data
                revalidatePath(key)
                revalidatePath(`/cms/edit${key}`)
                revalidatePath(`/cms/preview${key}`)
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
              async (data) => {
                await next(data)
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
              async (data) => {
                await next(data)
                updateTag("oberon-users")
              },
            changeRole:
              ({ next }) =>
              async (data) => {
                await next(data)
                updateTag("oberon-users")
              },
            getPageData: ({ next }) => cache(next, ["oberon-get-page-data"]),
            getAllPages: ({ next }) =>
              cache(next, ["oberon-get-all-pages"], {
                tags: ["oberon-pages"],
              }),
            getAllUsers: ({ next }) =>
              cache(next, ["oberon-get-all-users"], {
                tags: ["oberon-users"],
              }),
            getAllImages: ({ next }) =>
              cache(next, ["oberon-get-all-images"], {
                tags: ["oberon-images"],
              }),
            getSite: ({ next }) =>
              cache(next, ["oberon-get-site"], {
                tags: ["oberon-config"],
              }),
          }
        : {},
  }
}

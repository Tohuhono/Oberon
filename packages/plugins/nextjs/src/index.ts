import { type OberonPlugin } from "@oberoncms/core"
import { nextCookies } from "better-auth/next-js"
import { revalidatePath, updateTag, unstable_cache as cache } from "next/cache"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import { name, version } from "../package.json" with { type: "json" }

export { createRestHandler } from "./handler"

function invalidatePage({ key, type }: { key: string; type: string }) {
  if (type !== "page") return
  revalidatePath(key)
  revalidatePath("/cms/pages")
  revalidatePath(`/cms/edit${key}`)
  revalidatePath(`/cms/preview${key}`)
}

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
            updateFragmentData:
              ({ next }) =>
              async (page) => {
                await next(page)
                invalidatePage(page)
              },
            addFragment:
              ({ next }) =>
              async (page) => {
                await next(page)
                invalidatePage(page)
              },
            deleteFragment:
              ({ next }) =>
              async (data) => {
                await next(data)
                invalidatePage(data)
              },
            contentChanged:
              ({ next }) =>
              async () => {
                await next()
                revalidatePath("/", "layout")
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

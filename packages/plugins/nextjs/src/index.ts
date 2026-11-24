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
            updateFragmentData:
              ({ next }) =>
              async (fragment) => {
                const updatedAt = await next(fragment)
                if (fragment.type === "page") {
                  revalidatePath(fragment.key)
                  revalidatePath(`/cms/edit${fragment.key}`)
                  revalidatePath(`/cms/preview${fragment.key}`)
                  updateTag("oberon-pages")
                }
                updateTag("oberon-fragments")
                return updatedAt
              },
            addFragment:
              ({ next }) =>
              async (fragment) => {
                await next(fragment)
                if (fragment.type === "page") {
                  revalidatePath(fragment.key)
                  revalidatePath(`/cms/edit${fragment.key}`)
                  revalidatePath(`/cms/preview${fragment.key}`)
                  updateTag("oberon-pages")
                }
                updateTag("oberon-fragments")
              },
            deleteFragment:
              ({ next }) =>
              async (data) => {
                await next(data)
                if (data.type === "page") {
                  revalidatePath(data.key)
                  revalidatePath(`/cms/edit${data.key}`)
                  revalidatePath(`/cms/preview${data.key}`)
                  updateTag("oberon-pages")
                }
                updateTag("oberon-fragments")
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
            getFragmentData: ({ next }) =>
              cache(next, ["oberon-get-fragment-data"], { tags: ["oberon-fragments"] }),
            getAllFragments: ({ next }) =>
              cache(next, ["oberon-get-all-fragments"], {
                tags: ["oberon-fragments", "oberon-pages"],
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

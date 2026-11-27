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
            onComponentChange:
              ({ next }) =>
              async (component) => {
                await next(component)
                if (component.type === "page") {
                  revalidatePath(component.key)
                  revalidatePath(`/cms/edit${component.key}`)
                  revalidatePath(`/cms/preview${component.key}`)
                } else {
                  revalidatePath("/", "layout")
                }
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
          }
        : {},
  }
}

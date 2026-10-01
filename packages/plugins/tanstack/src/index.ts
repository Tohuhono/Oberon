import { type OberonPlugin } from "@oberoncms/core"
import { redirect, notFound } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { createAuthMiddleware } from "better-auth/api"
import { parseSetCookieHeader } from "better-auth/cookies"

import { name, version } from "../package.json" with { type: "json" }

export { createRestHandler } from "./handler"

const tanstackStartCookies = () => ({
  id: "tanstack-start-cookies",
  version,
  hooks: {
    after: [
      {
        matcher: () => true,
        handler: createAuthMiddleware(async (ctx) => {
          const returned = ctx.context.responseHeaders
          if ("_flag" in ctx && ctx._flag === "router") return
          if (!(returned instanceof Headers)) return

          const setCookies = returned.get("set-cookie")
          if (!setCookies) return

          const parsed = parseSetCookieHeader(setCookies)
          const { setCookie } = await import(
            /* @vite-ignore */ "@tanstack/start-server-core/request-response"
          )
          parsed.forEach((value, key) => {
            if (!key) return
            try {
              setCookie(key, value.value, {
                sameSite: value.samesite,
                secure: value.secure,
                maxAge: value["max-age"],
                httpOnly: value.httponly,
                domain: value.domain,
                path: value.path,
              })
            } catch {
              return
            }
          })
        }),
      },
    ],
  },
})

export const plugin: OberonPlugin = ({ phase }) => ({
  name,
  version,
  adapter:
    phase === "runtime"
      ? {
          redirect:
            () =>
            ({ href }) => {
              throw redirect({ to: href })
            },
          notFound: () => () => {
            throw notFound()
          },
          getRequestHeaders: () => async () => getRequest().headers,
          getAuthPlugins:
            ({ next }) =>
            () => [...next(), tanstackStartCookies()],
          updatePageData:
            ({ next }) =>
            async (page) => {
              await next(page)
              // revalidatePath(page.key)
              // updateTag("oberon-pages")
            },
          addPage:
            ({ next }) =>
            async (page) => {
              await next(page)
              // revalidatePath(page.key)
              // updateTag("oberon-pages")
            },
          deletePage:
            ({ next }) =>
            async (data) => {
              await next(data)
              // revalidatePath(key)
              // updateTag("oberon-pages")
            },
          updateSite:
            ({ next }) =>
            async (site) => {
              await next(site)
              // updateTag("oberon-config")
            },
          addImage:
            ({ next }) =>
            async (image) => {
              await next(image)
              // updateTag("oberon-images")
            },
          deleteImage:
            ({ next }) =>
            async (data) => {
              await next(data)
              // updateTag("oberon-images")
            },
          addUser:
            ({ next }) =>
            async (user) => {
              const createdUser = await next(user)
              // updateTag("oberon-users")
              return createdUser
            },
          deleteUser:
            ({ next }) =>
            async (data) => {
              await next(data)
              // updateTag("oberon-users")
            },
          changeRole:
            ({ next }) =>
            async (data) => {
              await next(data)
              // updateTag("oberon-users")
            },
          getPageData: ({ next }) => next,
          getAllPages: ({ next }) => next,
          getAllUsers: ({ next }) => next,
          getAllImages: ({ next }) => next,
          getSite: ({ next }) => next,
        }
      : {},
})

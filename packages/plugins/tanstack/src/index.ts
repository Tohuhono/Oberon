import { type OberonPlugin } from "@oberoncms/core"
import { redirect, notFound } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { createAuthMiddleware } from "better-auth/api"
import { parseSetCookieHeader } from "better-auth/cookies"

import { name, version } from "../package.json" with { type: "json" }

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
          redirect: ({ payload: { href } }) => {
            throw redirect({ to: href })
          },
          notFound: () => {
            throw notFound()
          },
          getRequestHeaders: async () => getRequest().headers,
          getAuthPlugins: ({ next }) => [...next({}), tanstackStartCookies()],
          updatePageData: async ({ next, payload: { page } }) => {
            await next({ page })
            // revalidatePath(page.key)
            // updateTag("oberon-pages")
          },
          addPage: async ({ next, payload: { page } }) => {
            await next({ page })
            // revalidatePath(page.key)
            // updateTag("oberon-pages")
          },
          deletePage: async ({ next, payload: { key } }) => {
            await next({ key })
            // revalidatePath(key)
            // updateTag("oberon-pages")
          },
          updateSite: async ({ next, payload: { site } }) => {
            await next({ site })
            // updateTag("oberon-config")
          },
          addImage: async ({ next, payload: { image } }) => {
            await next({ image })
            // updateTag("oberon-images")
          },
          deleteImage: async ({ next, payload: { key } }) => {
            await next({ key })
            // updateTag("oberon-images")
          },
          addUser: async ({ next, payload: { user } }) => {
            const createdUser = await next({ user })
            // updateTag("oberon-users")
            return createdUser
          },
          deleteUser: async ({ next, payload: { id } }) => {
            await next({ id })
            // updateTag("oberon-users")
          },
          changeRole: async ({ next, payload }) => {
            await next(payload)
            // updateTag("oberon-users")
          },
          getPageData: ({ next, payload }) => next(payload),
          getAllPages: ({ next, payload }) => next(payload),
          getAllUsers: ({ next, payload }) => next(payload),
          getAllImages: ({ next, payload }) => next(payload),
          getSite: ({ next, payload }) => next(payload),
        }
      : {},
})

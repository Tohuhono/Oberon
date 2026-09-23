import { type OberonPlugin } from "@oberoncms/core"
import { redirect, notFound } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { createAuthMiddleware } from "better-auth/api"
import { parseSetCookieHeader } from "better-auth/cookies"

import { name, version } from "../package.json" with { type: "json" }

const cache = <TProps, T>(f: (...props: TProps[]) => T, ..._rest: unknown[]) => f

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

export const plugin: OberonPlugin = (adapter, { phase } = { phase: "runtime" }) => ({
  name,
  version,
  adapter:
    phase === "runtime"
      ? {
          redirect: (url) => {
            throw redirect({ to: url })
          },
          notFound: () => {
            throw notFound()
          },
          getRequestHeaders: async () => getRequest().headers,
          getAuthPlugins: () => [...adapter.getAuthPlugins(), tanstackStartCookies()],
          updatePageData: async (data) => {
            await adapter.updatePageData(data)
            // revalidatePath(data.key)
            // updateTag("oberon-pages")
          },
          addPage: async (data) => {
            await adapter.addPage(data)
            // revalidatePath(data.key)
            // updateTag("oberon-pages")
          },
          deletePage: async (key) => {
            await adapter.deletePage(key)
            // revalidatePath(key)
            // updateTag("oberon-pages")
          },
          updateSite: async (data) => {
            await adapter.updateSite(data)
            // updateTag("oberon-config")
          },
          addImage: async (data) => {
            await adapter.addImage(data)
            // updateTag("oberon-images")
          },
          deleteImage: async (data) => {
            await adapter.deleteImage(data)
            // updateTag("oberon-images")
          },
          addUser: async (data) => {
            const user = await adapter.addUser(data)
            // updateTag("oberon-users")
            return user
          },
          deleteUser: async (data) => {
            await adapter.deleteUser(data)
            // updateTag("oberon-users")
          },
          changeRole: async (data) => {
            await adapter.changeRole(data)
            // updateTag("oberon-users")
          },
          getPageData: cache(adapter.getPageData),
          getAllPages: cache(adapter.getAllPages, undefined, { tags: ["oberon-pages"] }),
          getAllUsers: cache(adapter.getAllUsers, undefined, {
            tags: ["oberon-users"],
          }),
          getAllImages: cache(adapter.getAllImages, undefined, { tags: ["oberon-images"] }),
          getSite: cache(adapter.getSite, undefined, { tags: ["oberon-config"] }),
        }
      : {},
})

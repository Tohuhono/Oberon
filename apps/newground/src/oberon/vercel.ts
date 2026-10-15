import type { OberonPlugin } from "@oberoncms/core"
import { createMiddleware } from "@tanstack/react-start"
import { setResponseHeaders } from "@tanstack/react-start/server"

const globalTag = "oberon-public-pages"

async function pageTag(key: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))
  return `oberon-page-${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`
}

export const publicPage = createMiddleware().server(async ({ request, next }) => {
  const { adapter } = await import("./adapter")
  const cacheable =
    process.env.VERCEL === "1" &&
    request.method === "GET" &&
    adapter.hasPermission({ action: "pages", permission: "read" }) &&
    !["cookie", "authorization", "proxy-authorization", "range"].some((header) =>
      request.headers.has(header),
    )

  setResponseHeaders(
    new Headers({
      "Cache-Control": "private, no-store",
      "Vercel-CDN-Cache-Control": cacheable ? "public, max-age=31536000" : "private, no-store",
      Vary: "Accept, X-TSR-ServerFn",
    }),
  )
  return next()
})

export const plugin: OberonPlugin = ({ phase }) => ({
  name: "@oberon/newground/vercel",
  disabled: process.env.VERCEL !== "1",
  adapter:
    phase === "runtime"
      ? {
          getPageData:
            ({ next }) =>
            async (page) => {
              const { addCacheTag } = await import("@vercel/functions")
              await addCacheTag([globalTag, await pageTag(page.key)])
              return next(page)
            },
          invalidateCache: () => async (data) => {
            const tags = data?.tags ?? [globalTag]
            if (tags.length) {
              const { invalidateByTag } = await import("@vercel/functions")
              await invalidateByTag(tags)
            }
          },
          addPage:
            ({ next, getAdapter }) =>
            async (page) => {
              await next(page)
              await getAdapter().invalidateCache({ tags: [await pageTag(page.key)] })
            },
          updatePageData:
            ({ next, getAdapter }) =>
            async (page) => {
              await next(page)
              await getAdapter().invalidateCache({ tags: [await pageTag(page.key)] })
            },
          deletePage:
            ({ next, getAdapter }) =>
            async (page) => {
              await next(page)
              await getAdapter().invalidateCache({ tags: [await pageTag(page.key)] })
            },
        }
      : {},
})

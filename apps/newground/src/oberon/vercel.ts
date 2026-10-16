import { pageTag, type OberonPlugin } from "@oberoncms/core"
import { createMiddleware } from "@tanstack/react-start"
import { getResponseHeaders, setResponseHeader } from "@tanstack/react-start/server"
import { addCacheTag, invalidateByTag } from "@vercel/functions"

export const applyCDNHeaders = createMiddleware().server(async ({ request, next }) => {
  const cacheable =
    request.method === "GET" &&
    !["cookie", "authorization", "proxy-authorization", "range"].some((header) =>
      request.headers.has(header),
    )

  setResponseHeader(
    "Vercel-CDN-Cache-Control",
    cacheable ? "public, max-age=31536000" : "private, no-store",
  )
  getResponseHeaders().append("Vary", "Accept, X-TSR-ServerFn")
  return next()
})

export const plugin: OberonPlugin = ({ phase }) => ({
  name: "@oberon/newground/vercel",
  adapter:
    phase === "runtime"
      ? {
          getPageData:
            ({ next }) =>
            async (page) => {
              await addCacheTag(await pageTag(page.key))
              return next(page)
            },
          addPage:
            ({ next }) =>
            async (page) => {
              await next(page)
              await invalidateByTag(await pageTag(page.key))
            },
          updatePageData:
            ({ next }) =>
            async (page) => {
              await next(page)
              await invalidateByTag(await pageTag(page.key))
            },
          deletePage:
            ({ next }) =>
            async (page) => {
              await next(page)
              await invalidateByTag(await pageTag(page.key))
            },
        }
      : {},
})

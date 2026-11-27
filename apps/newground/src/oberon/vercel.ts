import { componentTag, type OberonPlugin } from "@oberoncms/core"
import { createMiddleware } from "@tanstack/react-start"
import { appendResponseHeader, setResponseHeader } from "@tanstack/react-start/server"
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
  appendResponseHeader("Vary", "Accept, X-TSR-ServerFn")
  return next()
})

export const plugin: OberonPlugin = ({ phase }) => ({
  name: "@oberon/newground/vercel",
  adapter:
    phase === "runtime"
      ? {
          getComponent:
            ({ next }) =>
            async ({ key }) => {
              await addCacheTag(await componentTag(key))
              return next({ key })
            },
          onComponentChange:
            ({ next }) =>
            async (component) => {
              await next(component)
              await invalidateByTag(await componentTag(component.key))
            },
        }
      : {},
})

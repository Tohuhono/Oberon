import { fragmentTag, type OberonPlugin } from "@oberoncms/core"
import { createMiddleware } from "@tanstack/react-start"
import { appendResponseHeader, setResponseHeader } from "@tanstack/react-start/server"
import { addCacheTag, invalidateByTag } from "@vercel/functions"

const sharedComponentsTag = "oberon-shared"

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
          getFragmentData:
            ({ next }) =>
            async ({ key }) => {
              const fragment = await next({ key })
              // Public Pages can read the entire library. One Shared tag fits Vercel's response tag limit.
              if (fragment?.type === "page" || (!fragment && key.startsWith("/"))) {
                await addCacheTag([await fragmentTag(key), sharedComponentsTag])
              } else {
                await addCacheTag(sharedComponentsTag)
              }
              return fragment
            },
          onFragmentChange:
            ({ next }) =>
            async (fragment) => {
              await next(fragment)
              await invalidateByTag(
                fragment.type === "page" ? await fragmentTag(fragment.key) : sharedComponentsTag,
              )
            },
        }
      : {},
})

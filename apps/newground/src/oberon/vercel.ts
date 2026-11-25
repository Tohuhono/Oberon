import { pageTag, type OberonPlugin } from "@oberoncms/core"
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
          getFragmentData:
            ({ next }) =>
            async ({ key }) => {
              const fragment = await next({ key })
              await addCacheTag("oberon-pages")
              if (fragment?.type === "page" || (!fragment && key.startsWith("/"))) {
                await addCacheTag(await pageTag(key))
              }
              return fragment
            },
          onFragmentChange:
            ({ next }) =>
            async (fragment) => {
              await invalidateFragment(fragment)
              await next(fragment)
            },
        }
      : {},
})

async function invalidateFragment(fragment: { key: string; type: "page" | "shared" }) {
  if (fragment.type === "page") {
    await invalidateByTag(await pageTag(fragment.key))
  } else {
    await invalidateByTag("oberon-pages")
  }
}

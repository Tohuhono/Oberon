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
            async (fragment) => {
              await addCacheTag("oberon-pages")
              if (fragment.type === "page") {
                await addCacheTag(await pageTag(fragment.key))
              }
              return next(fragment)
            },
          addFragment:
            ({ next }) =>
            async (fragment) => {
              const updatedAt = await next(fragment)
              await invalidateFragment(fragment)
              return updatedAt
            },
          updateFragmentData:
            ({ next }) =>
            async (fragment) => {
              const updatedAt = await next(fragment)
              await invalidateFragment(fragment)
              return updatedAt
            },
          deleteFragment:
            ({ next }) =>
            async (fragment) => {
              await next(fragment)
              await invalidateFragment(fragment)
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

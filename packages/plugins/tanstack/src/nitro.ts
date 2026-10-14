import { defineCachedFunction } from "nitro/cache"
import { defineHandler } from "nitro/h3"
import { useRuntimeConfig } from "nitro/runtime-config"
import { fetchViteEnv } from "nitro/vite/runtime"

import { getPageCacheRevision } from "./cache"

const render = (request: Request) => fetchViteEnv("ssr", request)

const cached = defineCachedFunction(
  async (request: Request, _key: string, _state: { status?: string }) => {
    const response = await render(request)
    const cacheable =
      response.status === 200 &&
      response.headers.get("Content-Type")?.includes("text/html") === true &&
      !response.headers.has("Set-Cookie") &&
      !response.headers.has("Content-Encoding") &&
      !/\b(private|no-store)\b/i.test(response.headers.get("Cache-Control") ?? "") &&
      !response.headers.has("Vary")
    if (!cacheable) return { cacheable: false as const, response }
    return {
      cacheable: true as const,
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers],
      body: await response.text(),
    }
  },
  {
    group: "oberon",
    name: "pages",
    maxAge: 3600,
    swr: false,
    getKey: (_request, key) => key,
    getMaxAge: (entry) => (entry.value?.cacheable ? 3600 : 0),
    transform: (entry, _request, _key, state) => {
      state.status = entry.status
    },
  },
)

export default defineHandler(async ({ req: request }) => {
  const url = new URL(request.url)
  if (
    request.method !== "GET" ||
    url.search ||
    /^\/(?:cms|assets|_serverFn|_build|_nitro)(?:\/|$)/.test(url.pathname) ||
    request.headers.has("Cookie") ||
    request.headers.has("Authorization") ||
    request.headers.has("Proxy-Authorization") ||
    request.headers.has("Range") ||
    request.headers.has("If-None-Match") ||
    request.headers.has("If-Modified-Since") ||
    !request.headers.get("Accept")?.includes("text/html")
  ) {
    return finish(await render(request))
  }

  const revision = await getPageCacheRevision()
  const { oberonCacheDeployment: deployment } = useRuntimeConfig()
  const key = encodeURIComponent(JSON.stringify([deployment, url.origin, url.pathname, revision]))
  const state: { status?: string } = {}
  const response = await cached(
    new Request(url, { headers: { Accept: "text/html" }, signal: request.signal }),
    key,
    state,
  )
  if (!response.cacheable) return finish(response.response.clone())

  const headers = new Headers(response.headers)
  headers.delete("Content-Length")
  headers.set("X-Oberon-Cache", state.status ?? "miss")
  return finish(
    new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }),
  )
})

function finish(response: Response) {
  if (!response.headers.get("Content-Type")?.includes("text/html")) return response
  const headers = new Headers(response.headers)
  headers.set("Cache-Control", "private, no-store")
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

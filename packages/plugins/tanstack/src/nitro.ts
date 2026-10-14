import { definePlugin } from "nitro"
import { defineCachedFunction } from "nitro/cache"
import { useStorage } from "nitro/storage"

import "./revalidate"

export function createPageCachePlugin({
  deployment,
  maxAge = 3600,
}: {
  deployment: string
  maxAge?: number
}) {
  return definePlugin((app) => {
    const render = app.fetch.bind(app)
    const storage = useStorage("cache:oberon")
    const revisionKey = `${deployment}:revision`

    globalThis.__oberonTanstackRevalidate = async () => {
      await storage.setItem(revisionKey, crypto.randomUUID())
    }

    const finish = (response: Response) => {
      if (!response.headers.has("X-Oberon-Page")) return response
      const headers = new Headers(response.headers)
      headers.delete("X-Oberon-Page")
      headers.set("Cache-Control", "private, no-store")
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    const cached = defineCachedFunction(
      async (request: Request, _key: string, _state: { status?: string }) => {
        const response = await render(request)
        const cacheable =
          response.status === 200 &&
          response.headers.get("X-Oberon-Page") === "1" &&
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
        name: deployment,
        maxAge,
        swr: false,
        getKey: (_request, key) => key,
        getMaxAge: (entry) => (entry.value?.cacheable ? maxAge : 0),
        transform: (entry, _request, _key, state) => {
          state.status = entry.status
        },
      },
    )

    app.fetch = async (request) => {
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

      const revision = await storage.getItem<string>(revisionKey)
      const key = encodeURIComponent(JSON.stringify([url.origin, url.pathname, revision]))
      const state: { status?: string } = {}
      const response = await cached(
        new Request(url, { headers: { Accept: "text/html" }, signal: request.signal }),
        key,
        state,
      )
      if (!response.cacheable) return finish(response.response.clone())
      const headers = new Headers(response.headers)
      headers.delete("X-Oberon-Page")
      headers.set("Cache-Control", "private, no-store")
      headers.set("X-Oberon-Cache", state.status ?? "miss")

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  })
}

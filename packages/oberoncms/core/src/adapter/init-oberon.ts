import type { NextRequest } from "next/server"
import {
  type OberonAdapter,
  type OberonConfig,
  type OberonPlugin,
  type OberonHandler,
  type OberonMethod,
} from "../lib/dtd"
import { initAdapter } from "./init-adapter"
import { initPlugins } from "./init-plugins"

function handle<TMethod extends OberonMethod = OberonMethod>(
  method: TMethod,
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>,
  adapter: OberonAdapter,
): OberonHandler<{ path: string[] }>[TMethod] {
  return async (request: NextRequest, { params }) => {
    const { path = [] } = await params
    const action = path?.[0]

    if (!action) {
      return new Response("", { status: 404 })
    }

    const handler = handlers[action]?.(adapter)[method]

    if (!handler) {
      return new Response("", { status: 405 })
    }

    return handler(request)
  }
}

function getTailwindHandler(adapter: OberonAdapter): OberonHandler {
  return {
    GET: async (request) => {
      const url = new URL(request.url)
      const name = url.pathname.split("/").at(-1)

      if (!name?.endsWith(".css")) {
        return new Response("", { status: 404 })
      }

      const hash = name.slice(0, -4)
      const asset = await adapter.getTailwindAsset(hash)

      if (!asset) {
        return new Response("", { status: 404 })
      }

      return new Response(asset.css, {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
          "content-type": "text/css; charset=utf-8",
        },
      })
    },
  }
}

export function initOberon({
  config,
  plugins,
  tailwind,
}: {
  config: OberonConfig
  plugins: OberonPlugin[]
  tailwind?: { sourceCssFile: string }
}): {
  handler: OberonHandler<{ path: string[] }>
  adapter: OberonAdapter
} {
  console.info("Initialise Oberon")

  const { versions, handlers, adapter: pluginAdapter } = initPlugins(plugins)

  const adapter = initAdapter({
    config,
    tailwind,
    versions,
    pluginAdapter,
  })

  const mergedHandlers = tailwind
    ? {
        ...handlers,
        tailwind: () => getTailwindHandler(adapter),
      }
    : handlers

  const handler = {
    GET: handle("GET", mergedHandlers, adapter),
    PUT: handle("PUT", mergedHandlers, adapter),
    PATCH: handle("PATCH", mergedHandlers, adapter),
    POST: handle("POST", mergedHandlers, adapter),
    DELETE: handle("DELETE", mergedHandlers, adapter),
  }

  return {
    handler,
    adapter,
  }
}

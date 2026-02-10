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

export function initOberon({
  config,
  plugins,
}: {
  config: OberonConfig
  plugins: OberonPlugin[]
}): {
  handler: OberonHandler<{ path: string[] }>
  adapter: OberonAdapter
} {
  const { versions, handlers, adapter: pluginAdapter } = initPlugins(plugins)

  const adapter = initAdapter({
    config,
    versions,
    pluginAdapter,
  })

  console.log("....")

  const handler = {
    GET: handle("GET", handlers, adapter),
    PUT: handle("PUT", handlers, adapter),
    PATCH: handle("PATCH", handlers, adapter),
    POST: handle("POST", handlers, adapter),
    DELETE: handle("DELETE", handlers, adapter),
  }

  return {
    handler,
    adapter,
  }
}

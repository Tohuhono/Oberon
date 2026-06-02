import type { NextRequest } from "next/server"

import {
  type OberonAdapter,
  type OberonConfig,
  type OberonHandler,
  type OberonMethod,
} from "../lib/dtd"
import { initAdapter } from "./init-adapter"
import { initPlugins } from "./init-plugins"

function handle<TMethod extends OberonMethod = OberonMethod>(
  method: TMethod,
  handlers: Record<string, OberonHandler>,
): OberonHandler<{ path: string[] }>[TMethod] {
  return async (request: NextRequest, { params }) => {
    const { path = [] } = await params
    const action = path?.[0]

    if (!action) {
      return new Response("", { status: 404 })
    }

    const handler = handlers[action]?.[method]

    if (!handler) {
      return new Response("", { status: 405 })
    }

    return handler(request)
  }
}

function initHandlers(
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>,
  adapter: OberonAdapter,
) {
  return Object.entries(handlers).reduce<Record<string, OberonHandler>>(
    (accumulator, [action, initHandler]) => {
      accumulator[action] = initHandler(adapter)
      return accumulator
    },
    {},
  )
}

export function initOberon({ client, plugins }: OberonConfig): {
  handler: OberonHandler<{ path: string[] }>
  adapter: OberonAdapter
} {
  console.info("Initialise Oberon")

  const { versions, handlers, adapter: pluginAdapter } = initPlugins(plugins, { phase: "runtime" })

  const adapter = initAdapter({
    config: client,
    versions,
    pluginAdapter,
  })

  const compiledHandlers = initHandlers(handlers, adapter)

  const handler = {
    GET: handle("GET", compiledHandlers),
    PUT: handle("PUT", compiledHandlers),
    PATCH: handle("PATCH", compiledHandlers),
    POST: handle("POST", compiledHandlers),
    DELETE: handle("DELETE", compiledHandlers),
  }

  return {
    handler,
    adapter,
  }
}

import type { OberonMethod, OberonHandler, OberonAdapter } from "../lib/dtd"

function handle<TMethod extends OberonMethod = OberonMethod>(
  method: TMethod,
  handlers: Record<string, OberonHandler>,
): OberonHandler<{ path: string[] }>[TMethod] {
  return async (request: Request, { params }) => {
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

export function initHandler(
  adapter: OberonAdapter,
  handlers: Record<string, (adapter: OberonAdapter) => OberonHandler>,
) {
  const compiledHandlers = Object.entries(handlers).reduce<Record<string, OberonHandler>>(
    (accumulator, [action, initHandler]) => {
      accumulator[action] = initHandler(adapter)
      return accumulator
    },
    {},
  )

  return {
    GET: handle("GET", compiledHandlers),
    PUT: handle("PUT", compiledHandlers),
    PATCH: handle("PATCH", compiledHandlers),
    POST: handle("POST", compiledHandlers),
    DELETE: handle("DELETE", compiledHandlers),
  }
}

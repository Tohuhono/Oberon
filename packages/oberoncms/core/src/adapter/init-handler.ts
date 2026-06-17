import type { OberonMethod, OberonHandler, OberonAdapter } from "../lib/dtd"

function handle<TMethod extends OberonMethod = OberonMethod>(
  method: TMethod,
  handlers: Record<string, OberonHandler>,
): OberonHandler<{ path?: string[] | string }>[TMethod] {
  return async (request: Request, { params }) => {
    const { path = [] } = await params

    const action = typeof path === "string" ? path.split("/")[0] : path?.[0]

    if (!action) {
      return Response.json({}, { status: 404 })
    }

    const handler = handlers[action]?.[method]

    if (!handler) {
      return Response.json({}, { status: 405 })
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

import type { OberonAdapter, OberonHandler, OberonMethod } from "../lib/dtd"

function handle<TMethod extends OberonMethod = OberonMethod>(
  method: TMethod,
  adapter: OberonAdapter,
): OberonHandler<{ path?: string[] | string }>[TMethod] {
  return async (request: Request, { params }) => {
    const { path = [] } = await params
    return adapter.handleRequest(request, { method, path })
  }
}

export function createRestHandler(adapter: OberonAdapter) {
  return {
    GET: handle("GET", adapter),
    PUT: handle("PUT", adapter),
    PATCH: handle("PATCH", adapter),
    POST: handle("POST", adapter),
    DELETE: handle("DELETE", adapter),
  }
}

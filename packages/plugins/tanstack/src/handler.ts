import type { OberonAdapter, OberonMethod } from "@oberoncms/core"

type TanStackRestHandler = (context: {
  request: Request
  params: { _splat?: string }
}) => Promise<Response>

function createHandler(
  method: OberonMethod,
  adapter: Pick<OberonAdapter, "handleRequest">,
): TanStackRestHandler {
  return ({ request, params: { _splat } }) =>
    adapter.handleRequest(request, { method, path: _splat })
}

export function createRestHandler(adapter: Pick<OberonAdapter, "handleRequest">) {
  return {
    GET: createHandler("GET", adapter),
    PUT: createHandler("PUT", adapter),
    PATCH: createHandler("PATCH", adapter),
    POST: createHandler("POST", adapter),
    DELETE: createHandler("DELETE", adapter),
  }
}

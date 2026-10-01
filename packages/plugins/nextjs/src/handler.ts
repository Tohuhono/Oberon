import type { OberonAdapter, OberonMethod } from "@oberoncms/core"

type NextRestHandler = (
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) => Promise<Response>

function createHandler(
  method: OberonMethod,
  adapter: Pick<OberonAdapter, "handleRequest">,
): NextRestHandler {
  return async (request, { params }) => {
    const { path = [] } = await params
    return adapter.handleRequest(request, { method, path })
  }
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

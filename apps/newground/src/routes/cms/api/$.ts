import { createFileRoute } from "@tanstack/react-router"

import { handler } from "../../../../oberon/adapter"

function getPath(params: { _splat?: string }) {
  return params._splat ? params._splat.split("/") : []
}

function getHandlerContext(params: { _splat?: string }) {
  return { params: Promise.resolve({ path: getPath(params) }) }
}

export const Route = createFileRoute("/cms/api/$")({
  server: {
    handlers: {
      GET: ({ params, request }) => handler.GET(request, getHandlerContext(params)),
      POST: ({ params, request }) => handler.POST(request, getHandlerContext(params)),
      PUT: ({ params, request }) => handler.PUT(request, getHandlerContext(params)),
      PATCH: ({ params, request }) => handler.PATCH(request, getHandlerContext(params)),
      DELETE: ({ params, request }) => handler.DELETE(request, getHandlerContext(params)),
    },
  },
})

import { createFileRoute } from "@tanstack/react-router"

import { handler } from "#/oberon/adapter"

export const Route = createFileRoute("/cms/api/$")({
  server: {
    handlers: {
      GET: ({ params: { _splat }, request }) => handler.GET(request, { params: { path: _splat } }),
      POST: ({ params: { _splat }, request }) =>
        handler.POST(request, { params: { path: _splat } }),
      PUT: ({ params: { _splat }, request }) => handler.PUT(request, { params: { path: _splat } }),
      PATCH: ({ params: { _splat }, request }) =>
        handler.PATCH(request, { params: { path: _splat } }),
      DELETE: ({ params: { _splat }, request }) =>
        handler.DELETE(request, { params: { path: _splat } }),
    },
  },
})

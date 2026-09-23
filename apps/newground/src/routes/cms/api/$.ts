import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/cms/api/$")({
  server: {
    handlers: {
      GET: async ({ params: { _splat }, request }) => {
        const { handler } = await import("#/oberon/adapter")
        return handler.GET(request, { params: { path: _splat } })
      },
      POST: async ({ params: { _splat }, request }) => {
        const { handler } = await import("#/oberon/adapter")
        return handler.POST(request, { params: { path: _splat } })
      },
      PUT: async ({ params: { _splat }, request }) => {
        const { handler } = await import("#/oberon/adapter")
        return handler.PUT(request, { params: { path: _splat } })
      },
      PATCH: async ({ params: { _splat }, request }) => {
        const { handler } = await import("#/oberon/adapter")
        return handler.PATCH(request, { params: { path: _splat } })
      },
      DELETE: async ({ params: { _splat }, request }) => {
        const { handler } = await import("#/oberon/adapter")
        return handler.DELETE(request, { params: { path: _splat } })
      },
    },
  },
})

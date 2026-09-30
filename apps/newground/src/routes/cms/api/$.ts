import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/cms/api/$")({
  server: {
    handlers: {
      GET: async ({ params: { _splat }, request }) => {
        const { restHandler } = await import("#/oberon/rest-handler")
        return restHandler.GET(request, { params: { path: _splat } })
      },
      POST: async ({ params: { _splat }, request }) => {
        const { restHandler } = await import("#/oberon/rest-handler")
        return restHandler.POST(request, { params: { path: _splat } })
      },
      PUT: async ({ params: { _splat }, request }) => {
        const { restHandler } = await import("#/oberon/rest-handler")
        return restHandler.PUT(request, { params: { path: _splat } })
      },
      PATCH: async ({ params: { _splat }, request }) => {
        const { restHandler } = await import("#/oberon/rest-handler")
        return restHandler.PATCH(request, { params: { path: _splat } })
      },
      DELETE: async ({ params: { _splat }, request }) => {
        const { restHandler } = await import("#/oberon/rest-handler")
        return restHandler.DELETE(request, { params: { path: _splat } })
      },
    },
  },
})

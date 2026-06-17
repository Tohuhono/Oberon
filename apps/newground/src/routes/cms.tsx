import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/cms")({
  loader: () => {
    throw notFound()
  },
})

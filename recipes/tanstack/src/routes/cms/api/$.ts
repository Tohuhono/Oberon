import "server-cli-only"
import { createRestHandler } from "@oberoncms/plugin-tanstack"
import { createFileRoute } from "@tanstack/react-router"

import { adapter } from "../../../../oberon/adapter"

export const Route = createFileRoute("/cms/api/$")({
  server: {
    handlers: createRestHandler(adapter),
  },
})

import { createFileRoute } from "@tanstack/react-router"

import { Home } from "#/components/home"

export const Route = createFileRoute("/")({ component: Home })

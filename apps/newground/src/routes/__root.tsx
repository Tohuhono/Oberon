import { createRootRoute } from "@tanstack/react-router"

import { Layout } from "#/components/layout"
import { NotFound } from "#/components/not-found"

import appCss from "../app.css?url"

export const metadata = {
  title: "Oberon CMS",
  description: "Built with puck by Tohuhono",
}

export const Route = createRootRoute({
  head: async () => {
    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Oberon CMS",
        },
        {
          name: "description",
          content: "Built with puck by Tohuhono",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: Layout,
})

import { resolveSlug } from "@oberoncms/core"
import { Render } from "@puckeditor/core"
import { createFileRoute } from "@tanstack/react-router"

import { adapter } from "#/oberon/adapter"
import { clientConfig } from "#/oberon/client.config"

function Oberon() {
  const data = Route.useLoaderData()

  return <Render data={data} config={clientConfig} />
}

export const Route = createFileRoute("/$")({
  loader: async ({ params }) => {
    const path = params._splat
    const slug = resolveSlug(path)
    const data = await adapter.getPageData(slug)

    if (!data) {
      return adapter.notFound()
    }

    return data
  },
  component: Oberon,
})

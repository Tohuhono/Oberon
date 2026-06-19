import { Render } from "@puckeditor/core"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { clientConfig } from "#/oberon/client.config"

const getPageData = createServerFn({ method: "GET" })
  .validator((data: { path: string | undefined }) => data)
  .handler(async ({ data }) => {
    const { resolveSlug } = await import("@oberoncms/core")
    const { adapter } = await import("#/oberon/adapter")

    return await adapter.getPageData(resolveSlug(data.path))
  })

function Oberon() {
  const data = Route.useLoaderData()

  return <Render data={data} config={clientConfig} />
}

export const Route = createFileRoute("/$")({
  loader: async ({ params }) => {
    const data = await getPageData({ data: { path: params._splat } })

    if (!data) {
      throw notFound()
    }

    return data
  },
  component: Oberon,
})

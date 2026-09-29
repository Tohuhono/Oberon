import { Render } from "@puckeditor/core"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { clientConfig } from "#/oberon/client.config"

function getActiveHash(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null)
    ? value.activeHash
    : null
}

const getPageData = createServerFn({ method: "GET" })
  .validator((data: { path: string | undefined }) => data)
  .handler(async ({ data }) => {
    const { resolveSlug } = await import("@oberoncms/core")
    const { adapter } = await import("#/oberon/adapter")

    const pageData = await adapter.getPageData(resolveSlug(data.path))
    const activeHash = getActiveHash(await adapter.getKV("@oberoncms/plugin-tailwind", "state"))
    const stylesheet = activeHash ? `/cms/api/tailwind/${encodeURIComponent(activeHash)}.css` : null

    return { pageData, stylesheet }
  })

function Oberon() {
  const { pageData, stylesheet } = Route.useLoaderData()

  return (
    <>
      {stylesheet ? <link rel="stylesheet" href={stylesheet} precedence="oberon-dynamic" /> : null}
      <Render data={pageData} config={clientConfig} />
    </>
  )
}

export const Route = createFileRoute("/$")({
  loader: async ({ params }) => {
    const data = await getPageData({ data: { path: params._splat } })

    if (!data.pageData) {
      throw notFound()
    }

    return { ...data, pageData: data.pageData }
  },
  component: Oberon,
})

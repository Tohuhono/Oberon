import { ResolvePathSchema } from "@oberoncms/core"
import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { renderServerComponent } from "@tanstack/react-start/rsc"

import { adapter, getPage, RenderPage } from "#/oberon/adapter"
import { applyCDNHeaders } from "#/oberon/vercel"

function getActiveHash(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null)
    ? value.activeHash
    : null
}

const getPageResponse = createServerFn({ method: "GET" })
  .middleware([applyCDNHeaders])
  .validator(ResolvePathSchema)
  .handler(async ({ data }) => {
    const page = await getPage(data)
    const activeHash = getActiveHash(
      await adapter.getKV({ namespace: "@oberoncms/plugin-tailwind", key: "state" }),
    )
    const stylesheet = activeHash ? `/cms/api/tailwind/${encodeURIComponent(activeHash)}.css` : null

    return await renderServerComponent(
      <>
        {stylesheet ? (
          <link rel="stylesheet" href={stylesheet} precedence="oberon-dynamic" />
        ) : null}
        <RenderPage page={page} />
      </>,
    )
  })

function Oberon() {
  const page = Route.useLoaderData()
  return page
}

export const Route = createFileRoute("/$")({
  server: { middleware: [applyCDNHeaders] },
  loader: ({ params }) => getPageResponse({ data: { key: `/${params._splat ?? ""}` } }),
  component: Oberon,
})

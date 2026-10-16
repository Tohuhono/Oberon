import { ResolvePathSchema } from "@oberoncms/core"
import { Render } from "@oberoncms/core/render"
import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { renderServerComponent } from "@tanstack/react-start/rsc"

import { actions } from "#/oberon/actions"
import { adapter } from "#/oberon/adapter"
import { clientConfig } from "#/oberon/client.config"
import { applyCDNHeaders } from "#/oberon/vercel"

function getActiveHash(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null)
    ? value.activeHash
    : null
}

const getPage = createServerFn({ method: "GET" })
  .middleware([applyCDNHeaders])
  .validator(ResolvePathSchema)
  .handler(async ({ data }) => {
    const page = await actions.resolvePath(data)
    const activeHash = getActiveHash(
      await adapter.getKV({ namespace: "@oberoncms/plugin-tailwind", key: "state" }),
    )
    const stylesheet = activeHash ? `/cms/api/tailwind/${encodeURIComponent(activeHash)}.css` : null

    return await renderServerComponent(
      <>
        {stylesheet ? (
          <link rel="stylesheet" href={stylesheet} precedence="oberon-dynamic" />
        ) : null}
        <Render data={page.data} config={clientConfig} />
      </>,
    )
  })

function Oberon() {
  const page = Route.useLoaderData()
  return <>{page}</>
}

export const Route = createFileRoute("/$")({
  server: { middleware: [applyCDNHeaders] },
  loader: ({ params }) => getPage({ data: { key: `/${params._splat ?? ""}` } }),
  component: Oberon,
})

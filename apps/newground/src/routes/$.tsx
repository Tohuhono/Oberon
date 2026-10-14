import { createActionHandler } from "@oberoncms/core/adapter"
import { Render } from "@oberoncms/core/render"
import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { renderServerComponent } from "@tanstack/react-start/rsc"

import { adapter } from "#/oberon/adapter"
import { clientConfig } from "#/oberon/client.config"

const actionHandler = createActionHandler(adapter)

function getActiveHash(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null)
    ? value.activeHash
    : null
}

const getPage = createServerFn({ method: "GET" })
  .validator((data: { path: string | undefined }) => data)
  .handler(async ({ data }) => {
    const page = await actionHandler.resolvePath({ key: `/${data.path ?? ""}` })
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
  headers: () => ({
    "X-Oberon-Page": "1",
    "Cache-Control": "public, max-age=0, must-revalidate",
  }),
  loader: ({ params }) => getPage({ data: { path: params._splat } }),
  component: Oberon,
})

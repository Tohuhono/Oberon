import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { renderServerComponent } from "@tanstack/react-start/rsc"

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
    const { Render } = await import("@oberoncms/core/render")
    const { adapter } = await import("#/oberon/adapter")
    const { clientConfig } = await import("#/oberon/client.config")

    const page = await Render({
      path: data.path?.split("/"),
      adapter,
      config: clientConfig,
    })
    const activeHash = getActiveHash(
      await adapter.getKV({ namespace: "@oberoncms/plugin-tailwind", key: "state" }),
    )
    const stylesheet = activeHash ? `/cms/api/tailwind/${encodeURIComponent(activeHash)}.css` : null

    return await renderServerComponent(
      <>
        {stylesheet ? (
          <link rel="stylesheet" href={stylesheet} precedence="oberon-dynamic" />
        ) : null}
        {page}
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

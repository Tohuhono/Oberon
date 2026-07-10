import { OberonQueryParamsSchema } from "@oberoncms/core"
import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import { getCmsContext } from "#/oberon/cms-context"

const CmsClient = lazy(() =>
  import("#/oberon/cms.client").then((module) => ({ default: module.CmsClient })),
)

function getCmsPath(path: string | undefined) {
  return path?.split("/").filter(Boolean) ?? []
}

function CmsSplatRoute() {
  const context = Route.useLoaderData()

  return (
    <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <CmsClient context={context} />
      </Suspense>
    </ClientOnly>
  )
}

export const Route = createFileRoute("/cms/$")({
  validateSearch: OberonQueryParamsSchema.parse,
  loaderDeps: ({ search }) => ({ searchParams: search }),
  loader: ({ deps, params }) =>
    getCmsContext({ data: { path: getCmsPath(params._splat), ...deps } }),
  component: CmsSplatRoute,
})

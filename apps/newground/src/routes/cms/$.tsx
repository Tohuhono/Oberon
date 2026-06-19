import { createFileRoute } from "@tanstack/react-router"

import { Cms, getCmsContext, validateCmsSearch } from "#/oberon/cms"

function getCmsPath(path: string | undefined) {
  return path?.split("/").filter(Boolean) ?? []
}

function CmsSplatRoute() {
  const context = Route.useLoaderData()

  return <Cms context={context} />
}

export const Route = createFileRoute("/cms/$")({
  validateSearch: validateCmsSearch,
  loaderDeps: ({ search }) => ({ searchParams: search }),
  loader: ({ deps, params }) =>
    getCmsContext({ data: { path: getCmsPath(params._splat), ...deps } }),
  component: CmsSplatRoute,
})

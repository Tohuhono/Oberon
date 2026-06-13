import { Render as PuckRender } from "@puckeditor/core/rsc"

import { type OberonAdapter, type OberonClientConfig } from "./lib/dtd"
import { resolveSlug } from "./lib/utils"

export async function Render({
  path = [],
  config: { components },
  adapter: { getPageData, notFound },
}: {
  path?: string[]
  config: OberonClientConfig
  adapter: OberonAdapter
}) {
  const slug = resolveSlug(path)

  const data = await getPageData(slug)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components }} />
}

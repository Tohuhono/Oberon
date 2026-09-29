import { Render as PuckRender } from "@puckeditor/core/rsc"

import { ResponseError, type OberonAdapter, type OberonClientConfig } from "./lib/dtd"
import { resolveSlug } from "./lib/utils"

export async function Render({
  path = [],
  config: { components },
  adapter,
}: {
  path?: string[]
  config: OberonClientConfig
  adapter: OberonAdapter
}) {
  if (!(await adapter.can("pages", "read"))) {
    throw new ResponseError("You do not have permission to perform this action")
  }

  const slug = resolveSlug(path)

  const data = await adapter.getPageData(slug)

  if (!data) {
    return adapter.notFound()
  }

  return <PuckRender data={data} config={{ components }} />
}

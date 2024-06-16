import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import { type OberonAdapter, type OberonConfig } from "./lib/dtd"
import { resolveSlug } from "./lib/utils"

export async function Render({
  path = [],
  config: { components },
  adapter: { getPageData },
}: {
  path?: string[]
  config: OberonConfig
  adapter: OberonAdapter
}) {
  const slug = resolveSlug(path)

  const data = await getPageData(slug)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components }} />
}

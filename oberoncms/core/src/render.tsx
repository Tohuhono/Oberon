import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import type { Config } from "@measured/puck"
import { OberonAdapter, type OberonConfig } from "./app/schema"
import { resolveSlug } from "./app/utils"

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

  return <PuckRender data={data} config={{ components } as Config} />
}

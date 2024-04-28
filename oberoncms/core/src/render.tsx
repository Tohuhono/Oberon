import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import type { Config } from "@measured/puck"
import { OberonServerActions, type OberonConfig } from "./app/schema"

export async function Render({
  slug = [],
  config: { blocks, resolvePath },
  adapter: { getPageData },
}: {
  slug?: string[]
  config: OberonConfig
  adapter: OberonServerActions
}) {
  const path = resolvePath(slug)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components: blocks } as Config} />
}

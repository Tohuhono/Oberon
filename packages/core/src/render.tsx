import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import type { Config } from "@measured/puck"
import { ServerActions, type OberonConfig } from "./app/schema"

export async function Render({
  slug = [],
  actions: { getPageData },
  config: { blocks, resolvePath },
}: {
  slug?: string[]
  config: OberonConfig
  actions: ServerActions
}) {
  const path = resolvePath(slug)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components: blocks } as Config} />
}

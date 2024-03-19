import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import type { Config } from "@measured/puck"
import { Actions, type OberonConfig } from "../schema"

export async function Render({
  slug = [],
  actions: { getPageData, resolvePath },
  config: { blocks },
}: {
  slug?: string[]
  config: OberonConfig
  actions: Actions
}) {
  const path = resolvePath(slug)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components: blocks } as Config} />
}

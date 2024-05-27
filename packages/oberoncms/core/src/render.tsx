import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import type { Config } from "@measured/puck"
import { OberonActions, type OberonConfig } from "./app/schema"
import { resolveSlug } from "./app/utils"

export async function Render({
  path = [],
  config: { components },
  actions: { getPageData },
}: {
  path?: string[]
  config: OberonConfig
  actions: OberonActions
}) {
  const slug = resolveSlug(path)

  const data = await getPageData(slug)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={{ components } as Config} />
}

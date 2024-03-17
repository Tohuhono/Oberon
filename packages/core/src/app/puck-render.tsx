import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import { Actions } from "../schema"
import { renderConfig } from "./renderConfig"

export async function Render({
  slug = [],
  actions: { getPageData, resolvePath },
}: {
  slug?: string[]
  actions: Actions
}) {
  const path = resolvePath(slug)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={renderConfig} />
}

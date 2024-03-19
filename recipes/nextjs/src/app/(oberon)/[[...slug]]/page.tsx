import { Render } from "@oberon/core/render"

import { actions } from "../actions"
import { config } from "../config"

export async function generateStaticParams() {
  return await actions.getAllPaths()
}

export async function generateMetadata({
  params: { slug },
}: {
  params: { framework: string; uuid: string; slug: string[] }
}) {
  const path = actions.resolvePath(slug)

  const data = await actions.getPageData(path)

  return {
    title: data?.root.title || "Oberon CMS built with Puck",
  }
}

export default function OberonRender({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Render slug={slug} actions={actions} config={config} />
}

import { Render } from "@oberon/core/render"

import { getMetaData } from "@oberon/core"
import { actions } from "../actions"
import { config } from "../config"

export async function generateStaticParams() {
  return await actions.getAllPaths()
}

export async function generateMetadata({
  params: { path },
}: {
  params: { framework: string; uuid: string; path: string[] }
}) {
  return getMetaData(config, actions, path)
}

export default function OberonRender({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Render slug={slug} actions={actions} config={config} />
}

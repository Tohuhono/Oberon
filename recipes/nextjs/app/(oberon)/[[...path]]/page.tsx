import { Render } from "@oberoncms/core/render"
import { getMetaData } from "@oberoncms/core"

import { actions } from "@/app/(oberon)/actions"
import { config } from "@/app/(oberon)/config"

export async function generateStaticParams() {
  return await actions.getAllPaths()
}

export async function generateMetadata({
  params: { path },
}: {
  params: { framework: string; uuid: string; path: string[] }
}) {
  return getMetaData(actions, path)
}

export default function OberonRender({
  params: { path },
}: {
  params: { path?: [] }
}) {
  return <Render path={path} actions={actions} config={config} />
}

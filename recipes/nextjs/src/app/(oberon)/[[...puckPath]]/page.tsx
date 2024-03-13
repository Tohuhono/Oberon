import { Render } from "@oberon/core/render"
import { initGenerateRenderMetadata } from "oberon"

import { actions } from "src/oberon-actions"

export const generateStaticParams = actions.getAllPaths

export const generateMetadata = initGenerateRenderMetadata(actions)

export default function OberonRender({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Render slug={slug} actions={actions} />
}

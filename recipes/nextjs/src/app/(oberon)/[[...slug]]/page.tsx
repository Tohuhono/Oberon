import {
  Render,
  initGenerateMetadata,
  initGenerateStaticParams,
} from "@oberon/core/render"

import { actions } from "src/oberon-actions"

export const generateStaticParams = initGenerateStaticParams(actions)

export const generateMetadata = initGenerateMetadata(actions)

export default function OberonRender({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Render slug={slug} actions={actions} />
}

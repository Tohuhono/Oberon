import { Client, getMetaData } from "@oberon/core/client"
import { actions } from "src/oberon-actions"

export function generateMetadata({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return getMetaData(slug, actions)
}

export default function OberonClient({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Client slug={slug} actions={actions} />
}

import { getMetaData } from "@oberon/core/editor"
import { actions } from "../../actions"
import { Client } from "./client"

export function generateMetadata({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return getMetaData(slug, actions)
}

export default function OberonClient({
  params: { slug = [] },
}: {
  params: { slug?: [] }
}) {
  return <Client slug={slug} actions={actions} />
}

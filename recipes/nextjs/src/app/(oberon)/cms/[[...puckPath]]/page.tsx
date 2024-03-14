import { Client } from "@oberon/core/client"
import { actions } from "src/oberon-actions"

export { generateMetadata } from "@oberon/core/client"

export default function OberonClient({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Client slug={slug} actions={actions} />
}

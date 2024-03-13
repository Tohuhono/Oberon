import { generateClientMetadata } from "@oberon/core"
import { Client } from "@oberon/core/client"
import { actions } from "src/oberon-actions"

export const generateMetadata = generateClientMetadata

export default function OberonClient({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Client slug={slug} actions={actions} />
}

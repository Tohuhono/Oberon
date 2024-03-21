import { getMetaData, getServerProps, parseClientAction } from "@oberon/core"

import { actions } from "../../actions"
import { config } from "../../config"
import { Client } from "./client"

export async function generateMetadata({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const action = parseClientAction(path[0] || "pages")
  const slug = path.slice(1)
  return await getMetaData(config, actions, slug, action)
}

export default async function OberonClient({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const action = path[0] || "pages"
  const slug = path.slice(1)
  const props = await getServerProps(config, actions, action, slug)

  return <Client actions={actions} {...props} />
}

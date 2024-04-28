import { getMetaData, getServerProps, parseClientAction } from "@oberoncms/core"

import { Client } from "./client"
import { actions } from "@/app/(oberon)/server-actions"

import { config } from "@/app/(oberon)/client-config"

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

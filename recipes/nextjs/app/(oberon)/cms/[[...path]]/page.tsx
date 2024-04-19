import { getMetaData, getServerProps, parseClientAction } from "@oberoncms/core"

import { adapter } from "@oberoncms/adapter-turso"
import { Client } from "./client"

import { config } from "@/app/(oberon)/client-config"

export async function generateMetadata({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const action = parseClientAction(path[0] || "pages")
  const slug = path.slice(1)
  return await getMetaData(config, adapter, slug, action)
}

export default async function OberonClient({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const action = path[0] || "pages"
  const slug = path.slice(1)
  const props = await getServerProps(config, adapter, action, slug)

  return <Client adapter={adapter} {...props} />
}

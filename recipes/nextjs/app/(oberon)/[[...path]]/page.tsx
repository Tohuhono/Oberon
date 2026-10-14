import { getMetaData } from "@oberoncms/core"
import { createActionHandler } from "@oberoncms/core/adapter"
import { Render } from "@oberoncms/core/render"

import { adapter } from "@/oberon/adapter"
import { clientConfig } from "@/oberon/client.config"

const actionHandler = createActionHandler(adapter)

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  return getMetaData(adapter, path)
}

export default async function OberonRender({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const page = await actionHandler.resolvePath({ key: `/${path.join("/")}` })
  return <Render data={page.data} config={clientConfig} />
}

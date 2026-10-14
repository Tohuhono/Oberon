import { getMetaData } from "@oberoncms/core"
import { Render } from "@oberoncms/core/render"

import { actions } from "@/oberon/actions"
import { adapter } from "@/oberon/adapter"
import { clientConfig } from "@/oberon/client.config"

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  return getMetaData(adapter, path)
}

export default async function OberonRender({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const page = await actions.resolvePath({ key: `/${path.join("/")}` })
  return <Render data={page.data} config={clientConfig} />
}

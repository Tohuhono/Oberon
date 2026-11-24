import { getMetaData } from "@oberoncms/core"

import { adapter, getPage, RenderPage } from "@/oberon/adapter"

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  return getMetaData(adapter, path)
}

export default async function OberonRender({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const page = await getPage({ key: `/${path.join("/")}` })
  return <RenderPage page={page} />
}

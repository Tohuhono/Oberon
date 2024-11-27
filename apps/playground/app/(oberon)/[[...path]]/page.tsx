import { Render } from "@oberoncms/core/render"

import { getMetaData } from "@oberoncms/core"

import { adapter } from "@/oberon/adapter"
import { config } from "@/oberon/config"

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path = [] } = await params
  return getMetaData(adapter, path)
}

export default async function OberonRender({
  params,
}: {
  params: Promise<{ path?: [] }>
}) {
  const { path = [] } = await params
  return <Render path={path} adapter={adapter} config={config} />
}

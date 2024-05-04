import { Render } from "@oberoncms/core/render"

import { getMetaData } from "@oberoncms/core"

import { adapter } from "@/app/(oberon)/server-config"
import { config } from "@/app/(oberon)/client-config"

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({
  params: { path },
}: {
  params: { framework: string; uuid: string; path: string[] }
}) {
  return getMetaData(adapter, path)
}

export default function OberonRender({
  params: { path },
}: {
  params: { path?: [] }
}) {
  return <Render path={path} adapter={adapter} config={config} />
}

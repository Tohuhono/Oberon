import { Render } from "@oberoncms/core/render"

import { getMetaData } from "@oberoncms/core"

import { adapter } from "@/app/(oberon)/server-config"
import { config } from "@/app/(oberon)/client-config"

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({
  params: { slug },
}: {
  params: { framework: string; uuid: string; slug: string[] }
}) {
  return getMetaData(config, adapter, slug)
}

export default function OberonRender({
  params: { slug },
}: {
  params: { slug?: [] }
}) {
  return <Render slug={slug} adapter={adapter} config={config} />
}

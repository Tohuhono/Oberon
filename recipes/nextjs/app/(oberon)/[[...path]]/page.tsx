import { getPageMetadata } from "@oberoncms/core"
import { cache } from "react"

import { adapter, RenderPage } from "@/oberon/adapter"

const getPage = cache((key: string) => adapter.getPage({ key }))

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const page = await getPage(`/${path.join("/")}`)
  return getPageMetadata(page.data)
}

export default async function OberonRender({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const page = await getPage(`/${path.join("/")}`)
  return <RenderPage page={page} />
}

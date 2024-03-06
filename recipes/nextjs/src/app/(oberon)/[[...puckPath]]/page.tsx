import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getAllPaths, getPageData } from "@/puck/src/actions"

import { PuckRender } from "@/puck/puck-render"
import { resolvePuckPath } from "@/lib/puck/resolve-puck-path"
import { renderConfig } from "@/lib/puck/renderConfig"

export async function generateStaticParams() {
  return getAllPaths()
}

// TODO description
export async function generateMetadata({
  params: { puckPath },
}: {
  params: { framework: string; uuid: string; puckPath: string[] }
}): Promise<Metadata> {
  const path = resolvePuckPath(puckPath)

  const data = await getPageData(path)

  return {
    title: data?.root.title || "Oberon CMS",
  }
}

export default async function RenderPage({
  params: { puckPath },
}: {
  params: { puckPath: string[] }
}) {
  const path = resolvePuckPath(puckPath)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={renderConfig} />
}

import { Render as PuckRender } from "@measured/puck/rsc"
import { notFound } from "next/navigation"
import { Metadata } from "next/types"
import { resolvePuckPath } from "./resolve-puck-path"
import { renderConfig } from "./renderConfig"
import { Actions } from "../schema"

export function initGenerateStaticParams({ getAllPaths }: Actions) {
  return async function () {
    return getAllPaths()
  }
}

// TODO description
export function initGenerateMetadata({ getPageData }: Actions) {
  return async function ({
    params: { puckPath },
  }: {
    params: { framework: string; uuid: string; puckPath: string[] }
  }): Promise<Metadata> {
    const path = resolvePuckPath(puckPath)

    const data = await getPageData(path)

    return {
      title: data?.root.title || "Datacom Digital Experience Platforms",
    }
  }
}

export async function Render({
  slug = [],
  actions: { getPageData },
}: {
  slug?: string[]
  actions: Actions
}) {
  const path = resolvePuckPath(slug)

  const data = await getPageData(path)

  if (!data) {
    return notFound()
  }

  return <PuckRender data={data} config={renderConfig} />
}

export function initRenderPage({ getPageData }: Actions) {
  return async function ({
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
}

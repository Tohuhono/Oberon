import { getMetaData, actionPaths } from "@oberoncms/core"
import { OberonProvider } from "@oberoncms/core/provider"

import { Client } from "./client"
import { actions } from "@/oberon/actions"
import { adapter } from "@/oberon/adapter"

export function generateStaticParams() {
  return actionPaths
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path = [] } = await params
  return await getMetaData(adapter, path.slice(1), path[0])
}

export default async function Oberon({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { path = [] } = await params
  return (
    <OberonProvider
      adapter={adapter}
      actions={actions}
      path={path}
      searchParams={await searchParams}
    >
      <Client />
    </OberonProvider>
  )
}

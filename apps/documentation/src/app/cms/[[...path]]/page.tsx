import { getMetaData, actionPaths } from "@oberoncms/core"
import { OberonProvider } from "@oberoncms/core/provider"

import { Client } from "./client"
import { actions } from "@/oberon/actions"
import { adapter } from "@/oberon/adapter"

export function generateStaticParams() {
  return actionPaths
}

export async function generateMetadata({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  return await getMetaData(adapter, path.slice(1), path[0])
}

export default async function Oberon({
  params: { path = [] },
  searchParams,
}: {
  params: { path?: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <OberonProvider
      adapter={adapter}
      actions={actions}
      path={path}
      searchParams={searchParams}
    >
      <Client />
    </OberonProvider>
  )
}

import { getMetaData } from "@oberoncms/core"
import { Client } from "./client"
import { actions } from "@/oberon/actions"

export async function generateStaticParams() {
  return await actions.getAllPaths()
}

export async function generateMetadata({
  params: { path },
}: {
  params: { framework: string; uuid: string; path: string[] }
}) {
  return getMetaData(actions, path)
}

export default async function Oberon({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  return <Client path={path} />
}

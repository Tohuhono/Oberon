import { Metadata } from "next"
import { DynamicClient } from "./client.dynamic"
import resolvePuckPath from "@/lib/resolve-puck-path"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath?: string[] }>
}): Promise<Metadata> {
  const { puckPath } = await params
  const { isEdit, path } = resolvePuckPath(puckPath)

  if (isEdit) {
    return {
      title: "Editing: " + path,
    }
  }

  return {
    title: "",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath?: string[] }>
}) {
  const { puckPath } = await params
  const { isEdit, path } = resolvePuckPath(puckPath)

  return <DynamicClient isEdit={isEdit} path={path} />
}

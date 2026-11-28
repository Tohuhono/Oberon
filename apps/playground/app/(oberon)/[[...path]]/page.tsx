import { getPageMetadata } from "@oberoncms/core"
import { cache } from "react"

import { adapter, RenderPage } from "@/oberon/adapter"

const getPage = cache((key: string) => adapter.getPage({ key }))

function getActiveHash(value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "activeHash" in value &&
    (typeof value.activeHash === "string" || value.activeHash === null)
    ? value.activeHash
    : null
}

async function getDynamicStylesheets() {
  try {
    const activeHash = getActiveHash(
      await adapter.getKV({ namespace: "@oberoncms/plugin-tailwind", key: "state" }),
    )

    return activeHash &&
      typeof (await adapter.getKV({
        namespace: "@oberoncms/plugin-tailwind",
        key: `asset:${activeHash}`,
      })) === "string"
      ? [`/cms/api/tailwind/${encodeURIComponent(activeHash)}.css`]
      : []
  } catch {
    return []
  }
}

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

  const stylesheets = await getDynamicStylesheets()

  return (
    <>
      {stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="oberon-dynamic" />
      ))}
      <RenderPage page={page} />
    </>
  )
}

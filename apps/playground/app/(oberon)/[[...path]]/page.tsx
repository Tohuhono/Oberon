import { Render } from "@oberoncms/core/render"

import { getMetaData } from "@oberoncms/core"

import { adapter } from "@/oberon/adapter"
import { config } from "@/oberon/config"

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
      await adapter.getSetting("@oberoncms/plugin-tailwind", "state"),
    )

    return activeHash &&
      typeof (await adapter.getSetting(
        "@oberoncms/plugin-tailwind",
        `asset:${activeHash}`,
      )) === "string"
      ? [`/cms/api/tailwind/${encodeURIComponent(activeHash)}.css`]
      : []
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  return await adapter.getAllPaths()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path = [] } = await params
  return getMetaData(adapter, path)
}

export default async function OberonRender({
  params,
}: {
  params: Promise<{ path?: [] }>
}) {
  const { path = [] } = await params
  const stylesheets = await getDynamicStylesheets()

  return (
    <>
      {stylesheets.map((href) => (
        <link
          key={href}
          rel="stylesheet"
          href={href}
          precedence="oberon-dynamic"
        />
      ))}
      <Render path={path} adapter={adapter} config={config} />
    </>
  )
}

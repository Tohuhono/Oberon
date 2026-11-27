import { Render as PuckRender } from "@puckeditor/core/rsc"

import { initAdapter } from "./adapter"
import type { OberonClientConfig, OberonConfig, PageData } from "./lib/dtd"

export function initOberon(config: OberonConfig) {
  const adapter = initAdapter(config)

  function RenderPage({ page }: { page: Awaited<ReturnType<typeof adapter.getPage>> }) {
    return <Render data={page.data} config={config.client} />
  }

  return { adapter, RenderPage }
}

export function Render({
  data,
  config: { components },
}: {
  data: PageData
  config: OberonClientConfig
}) {
  return <PuckRender data={data} config={{ components }} />
}

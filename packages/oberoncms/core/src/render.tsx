import { resolveAllData, type Config, type Data, type Metadata } from "@puckeditor/core"
import { Render as PuckRender } from "@puckeditor/core/rsc"

import { initAdapter } from "./adapter"
import { withSharedComponent } from "./components/shared-component-render"
import type { OberonClientConfig, OberonConfig, PageData, SharedComponentData } from "./lib/dtd"
import { getSharedComponentLibrary } from "./lib/shared-components"

export function initOberon(config: OberonConfig) {
  const adapter = initAdapter(config)

  async function RenderPage({ page }: { page: Awaited<ReturnType<typeof adapter.getPage>> }) {
    const sharedComponents = await getSharedComponentLibrary(adapter)

    return <Render data={page.data} config={config.client} sharedComponents={sharedComponents} />
  }

  return { adapter, RenderPage }
}

export async function Render({
  data,
  config,
  sharedComponents = {},
}: {
  data: PageData
  config: OberonClientConfig
  sharedComponents?: Record<string, SharedComponentData>
}) {
  const sharedConfig = withSharedComponent(
    config,
    (props) => <ResolvedPuckTree {...props} />,
    sharedComponents,
  )

  return ResolvedPuckTree({ data, config: sharedConfig, metadata: { sharedComponents } })
}

async function ResolvedPuckTree({
  config,
  data,
  metadata,
}: {
  config: Config
  data: Data
  metadata: Metadata
}) {
  const resolvedData = await resolveAllData(data, config, metadata)
  return <PuckRender data={resolvedData} config={config} metadata={metadata} />
}

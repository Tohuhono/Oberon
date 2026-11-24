import { resolveAllData } from "@puckeditor/core"
import { Render as PuckRender } from "@puckeditor/core/rsc"

import { initAdapter } from "./adapter"
import { resolvePage } from "./adapter/init-action-handler"
import { withSharedComponent } from "./components/shared-component-render"
import type { OberonClientConfig, OberonConfig, PageData, SharedComponentData } from "./lib/dtd"
import { getSharedComponentLibrary } from "./lib/shared-components"

export function initOberon(config: OberonConfig) {
  const adapter = initAdapter(config)

  const getPage = ({ key }: { key: string }) => resolvePage(adapter, key)

  async function RenderPage({ page }: { page: Awaited<ReturnType<typeof getPage>> }) {
    const sharedComponents = await getSharedComponentLibrary(adapter)

    return <Render data={page.data} config={config.client} sharedComponents={sharedComponents} />
  }

  return { adapter, getPage, RenderPage }
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
    ({ config: nestedConfig, data: nestedData, metadata }) => (
      <PuckRender data={nestedData} config={nestedConfig} metadata={metadata} />
    ),
    sharedComponents,
  )
  const metadata = { sharedComponents }
  const resolvedData = await resolveAllData(data, sharedConfig, metadata)

  return <PuckRender data={resolvedData} config={sharedConfig} metadata={metadata} />
}

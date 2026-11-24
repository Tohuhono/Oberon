import { Render, type Config, type Data } from "@puckeditor/core"

import { useLocalData } from "../hooks/use-local-data"
import type { SharedComponentData } from "../lib/dtd"
import { withSharedComponent } from "./shared-component-render"

export function Preview({
  path,
  data,
  config,
  sharedComponents,
}: {
  path: string
  config: Config
  data: Data | null
  sharedComponents: Record<string, SharedComponentData>
}) {
  const sharedConfig = withSharedComponent(
    config,
    ({ config: renderConfig, data: renderData, metadata }) => (
      <Render data={renderData} config={renderConfig} metadata={metadata} />
    ),
    sharedComponents,
  )
  const localData = useLocalData(path, sharedConfig)[0]

  if (!localData || !data) {
    return null
  }

  return <Render data={localData} config={sharedConfig} metadata={{ sharedComponents }} />
}

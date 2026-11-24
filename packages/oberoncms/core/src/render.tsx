import { Render as PuckRender } from "@puckeditor/core/rsc"

import type { OberonAdapter, OberonClientConfig, FragmentData } from "./lib/dtd"

export async function Render({
  data,
  config,
  adapter,
}: {
  data: FragmentData
  config: OberonClientConfig
  adapter?: Pick<OberonAdapter, "prepareContent">
}) {
  const prepared = adapter ? await adapter.prepareContent({ config, data }) : { config, data }
  return <PuckRender data={prepared.data} config={prepared.config} />
}

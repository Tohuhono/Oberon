import { Render as PuckRender } from "@puckeditor/core/rsc"

import type { OberonClientConfig, PageData } from "./lib/dtd"

export function Render({
  data,
  config: { components },
}: {
  data: PageData
  config: OberonClientConfig
}) {
  return <PuckRender data={data} config={{ components }} />
}

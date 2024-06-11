import { Render } from "@oberoncms/core/render"

import { actions } from "@/oberon/actions"
import { config } from "@/oberon/config"

export function Client({ path }: { path?: string[] }) {
  return <Render path={path} actions={actions} config={config} />
}

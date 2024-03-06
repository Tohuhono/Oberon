import type { Config, Data } from "@measured/puck"
import { Render } from "@measured/puck/dist/rsc"

export function PuckRender({ data, config }: { data: Data; config: Config }) {
  return <Render data={data} config={config} />
}

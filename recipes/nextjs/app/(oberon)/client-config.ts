import { Prose } from "@tohuhono/puck-blocks/prose"
import { Div } from "@tohuhono/puck-blocks/div"
import { PuckRichText } from "@tohuhono/puck-rich-text"
import type { OberonConfig } from "@oberoncms/core"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    PuckRichText,
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

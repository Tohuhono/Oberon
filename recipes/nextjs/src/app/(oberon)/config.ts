import { Prose } from "@oberon/blocks/prose"
import { Div } from "@oberon/blocks/div"
import { PuckRichText } from "@tohuhono/puck-rich-text"
import type { OberonConfig } from "@oberon/core"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    PuckRichText,
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

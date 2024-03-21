import { Prose } from "@oberon/blocks/prose"
import { Div } from "@oberon/blocks/div"
import { RichTextEditor } from "@tohuhono/puck-rich-text"
import type { OberonConfig } from "@oberon/core"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    RichTextEditor,
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

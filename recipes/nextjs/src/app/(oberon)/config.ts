import type { OberonConfig } from "@oberon/core"
import { Prose } from "@oberon/blocks/prose"
import { Div } from "@oberon/blocks/div"
import { RichTextEditor } from "@oberon/blocks/rich-text"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    RichTextEditor,
  },
}

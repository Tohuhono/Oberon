import type { Config } from "@measured/puck"
import { Prose } from "@oberon/blocks/prose"
import { Div } from "@oberon/blocks/div"
import { RichTextEditor } from "@oberon/blocks/rich-text"

export const renderConfig = {
  components: {
    Prose,
    Div,
    RichTextEditor,
  },
} as Config

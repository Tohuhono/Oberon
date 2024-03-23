import type { Config } from "@measured/puck"
import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text"

export const config: Config<{
  PuckRichText: PuckRichTextProps
}> = {
  components: {
    PuckRichText,
  },
}

export default config

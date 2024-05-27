"use client"

import { ComponentProps } from "react"
import { InlineRichTextEditor } from "./lexical/rich-text-editor"

export function Render(
  props: Omit<ComponentProps<typeof InlineRichTextEditor>, "enabled">,
) {
  return <InlineRichTextEditor enabled={false} {...props} />
}

"use client"

import type { SerializedEditorState } from "lexical/LexicalEditorState"
import { InlineRichTextEditor } from "./lexical/rich-text-editor"
import { useSelected } from "./use-selected"

export type RichTextProps = {
  state: SerializedEditorState
}

export function Editor({
  id,
  state,
}: {
  id: string
  state: SerializedEditorState
}) {
  const { isSelected, onChange } = useSelected(id)

  return (
    <div
      style={{
        cursor: isSelected ? "default" : "grab",
        pointerEvents: "auto",
      }}
    >
      <InlineRichTextEditor
        id={id}
        state={state}
        onChange={onChange}
        enabled={isSelected}
      />
    </div>
  )
}

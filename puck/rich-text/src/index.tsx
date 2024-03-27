import type { ComponentConfig } from "@measured/puck"
import type { SerializedEditorState } from "lexical"
import { Editor } from "./rich-text-editor/editor-client"
import { Render } from "./rich-text-editor/render-client"

export type RichTextState = SerializedEditorState

export type PuckRichTextProps = {
  state: RichTextState
}

export const PuckRichText = {
  fields: {
    state: {
      type: "custom",
      render: () => <></>,
    },
  },
  render: ({
    editMode,
    ...props
  }: {
    editMode?: boolean
    id: string
    state: RichTextState
  }) => {
    return editMode ? <Editor {...props} /> : <Render {...props} />
  },
} satisfies ComponentConfig<PuckRichTextProps>

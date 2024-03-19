import type { ComponentConfig } from "@measured/puck"
import type { SerializedEditorState } from "lexical"
import { Editor } from "./rich-text-editor/editor-client"
import { Render } from "./rich-text-editor/render-client"

export type RichTextEditorProps = {
  state: SerializedEditorState
}

export const RichTextEditor: ComponentConfig<RichTextEditorProps> = {
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
    state: SerializedEditorState
  }) => (editMode ? <Editor {...props} /> : <Render {...props} />),
}

import type { SerializedEditorState } from "lexical/LexicalEditorState"
import type { ComponentConfig } from "@measured/puck"
import { Render } from "./rich-text-editor/render-server"

export const RichTextEditor = {
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
  }) => {
    return <Render {...props} />
  },
} satisfies ComponentConfig<{
  state: SerializedEditorState
}>

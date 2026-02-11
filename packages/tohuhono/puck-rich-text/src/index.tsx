import type { ComponentConfig } from "@puckeditor/core"
import type { SerializedEditorState } from "lexical"

import { Editor } from "./rich-text-editor/editor-client"
import { Render } from "./rich-text-editor/render-client"

export type PuckRichTextProps = {
  state: SerializedEditorState
}

export const PuckRichText = {
  fields: {
    state: {
      type: "custom",
      render: () => <></>,
    },
  },
  render: ({ puck, ...props }) => {
    return puck.isEditing ? <Editor {...props} /> : <Render {...props} />
  },
} satisfies ComponentConfig<PuckRichTextProps>

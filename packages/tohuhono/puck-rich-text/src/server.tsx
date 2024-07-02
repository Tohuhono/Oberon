import type { SerializedEditorState } from "lexical"
import type { ComponentConfig } from "@measured/puck"
import { Render } from "./rich-text-editor/render-server"

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
  render: (props) => {
    return <Render {...props} />
  },
} satisfies ComponentConfig<{
  state: SerializedEditorState
}>

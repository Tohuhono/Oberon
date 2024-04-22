import type { ComponentConfig } from "@measured/puck"
import type { SerializedEditorState } from "lexical"

import dynamic from "next/dynamic"
import { Render } from "./rich-text-editor/render-client"

const Editor = dynamic(
  () => import("./rich-text-editor/editor-client").then((m) => m.Editor),
  { ssr: false },
)

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
  render: ({
    editMode,
    ...props
  }: {
    editMode?: boolean
    id: string
    state: SerializedEditorState
  }) => {
    return editMode ? <Editor {...props} /> : <Render {...props} />
  },
} satisfies ComponentConfig<PuckRichTextProps>

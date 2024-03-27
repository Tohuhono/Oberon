import type { ComponentConfig } from "@measured/puck"
import { Render } from "./rich-text-editor/render-server"
import type { RichTextState } from "."

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
    return <Render {...props} />
  },
} satisfies ComponentConfig<{
  state: RichTextState
}>

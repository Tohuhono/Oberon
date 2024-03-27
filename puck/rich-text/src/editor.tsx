import { InlineRichTextEditor } from "./rich-text-editor/lexical/rich-text-editor"
import type { RichTextState } from "."

export const RichText = ({
  id,
  state,
  toolbarTarget,
  enabled,
  onChange,
}: {
  enabled: boolean
  toolbarTarget: HTMLElement | null
  id: string
  state: RichTextState
  onChange: (props: { state: RichTextState }) => void
}) => {
  return (
    <>
      <InlineRichTextEditor
        id={id}
        state={state}
        toolbarTarget={toolbarTarget}
        onChange={onChange}
        enabled={enabled}
      />
    </>
  )
}

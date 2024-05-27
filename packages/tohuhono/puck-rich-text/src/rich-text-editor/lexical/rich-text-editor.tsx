import { SerializedEditorState } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import { useState } from "react"
import { FocusPlugin } from "./plugins/focus-plugin"
import { ToolbarPlugin } from "./plugins/toolbar-plugin"

const PlaceHolder = () => (
  <div style={{ pointerEvents: "none", position: "absolute", top: 0 }}>
    Click to edit
  </div>
)

export const InlineRichTextEditor = ({
  id,
  state,
  enabled,
  onChange = () => {},
}: {
  id: string
  state: SerializedEditorState
  enabled: boolean
  onChange?: (props: { state: SerializedEditorState }) => void
}) => {
  const [_isLinkEditMode, setIsLinkEditMode] = useState(false)

  return (
    <div style={{ position: "relative" }}>
      <LexicalComposer
        initialConfig={{
          namespace: id,
          editable: false,
          editorState: JSON.stringify(state),
          nodes: [
            HeadingNode,
            QuoteNode,
            AutoLinkNode,
            LinkNode,
            ListItemNode,
            ListNode,
            CodeHighlightNode,
            CodeNode,
          ],
          onError(error: unknown) {
            throw error
          },
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable style={{ outline: "none" }} />}
          placeholder={<PlaceHolder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(state) => onChange({ state: state.toJSON() })}
        />
        <FocusPlugin enabled={enabled} />
        <HistoryPlugin />

        <ToolbarPlugin
          id={id}
          showToolbar={enabled}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      </LexicalComposer>
    </div>
  )
}

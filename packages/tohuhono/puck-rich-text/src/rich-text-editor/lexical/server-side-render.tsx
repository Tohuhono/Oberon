import type { SerializedEditorState } from "lexical"
import { $generateHtmlFromNodes } from "@lexical/html"
import { createHeadlessEditor } from "@lexical/headless"
import { JSDOM } from "jsdom"
import DOMPurify from "dompurify"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"

const editor = createHeadlessEditor({
  namespace: "ssr-editor",
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
  onError: (error) => {
    console.log("headless lexical error", error)
  },
})

function setupDom() {
  const dom = new JSDOM()

  const _window = global.window
  const _document = global.document

  // @ts-expect-error we are intentionally fooling lexical
  global.window = dom.window
  global.document = dom.window.document

  return () => {
    global.window = _window
    global.document = _document
  }
}

export async function ServerSideRender({
  state,
}: {
  state: SerializedEditorState
}) {
  if (!state) {
    return null
  }

  const __html: string = await new Promise((resolve) => {
    editor.setEditorState(editor.parseEditorState(state))

    editor.update(async () => {
      const cleanup = setupDom()

      try {
        const purify = DOMPurify(window)
        const raw = $generateHtmlFromNodes(editor, null)
        const html = purify.sanitize(raw)

        resolve(html)
      } finally {
        cleanup()
      }
    })
  })

  return <div dangerouslySetInnerHTML={{ __html }} />
}

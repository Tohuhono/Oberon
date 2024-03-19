import type { SerializedEditorState } from "lexical/LexicalEditorState"
import { $generateHtmlFromNodes } from "@lexical/html"
import { createHeadlessEditor } from "@lexical/headless"
import { JSDOM } from "jsdom"
import DOMPurify from "dompurify"

const editor = createHeadlessEditor({
  namespace: "ssr-editor",
  onError: (error) => {
    console.log("headless lexical error", error)
  },
})

function setupDom() {
  const dom = new JSDOM()

  const _window = global.window
  const _document = global.document

  // @ts-expect-error we are intentially making a fake window because lexical
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

  const html: string = await new Promise((resolve) => {
    editor.update(() => {
      const cleanup = setupDom()

      try {
        editor.setEditorState(editor.parseEditorState(state))

        const purify = DOMPurify(window)

        const raw = $generateHtmlFromNodes(editor)
        const html = purify.sanitize(raw)

        resolve(html)
      } finally {
        cleanup()
      }
    })
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

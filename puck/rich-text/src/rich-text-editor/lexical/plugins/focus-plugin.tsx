import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useEffect } from "react"

export const FocusPlugin = ({ enabled }: { enabled: boolean }): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (enabled) {
      editor.setEditable(true)
      // set timeout to fix race condition https://github.com/facebook/lexical/issues/4460
      setTimeout(() => editor.focus()) //
      return
    }
    editor.setEditable(false)
  }, [enabled, editor])

  return null
}

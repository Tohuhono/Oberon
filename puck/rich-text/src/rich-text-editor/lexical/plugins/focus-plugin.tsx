import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"

export const FocusPlugin = ({ enabled }: { enabled: boolean }): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (enabled) {
      editor.setEditable(true)
      editor.focus()
      return
    }
    editor.setEditable(false)
  }, [enabled, editor])

  return null
}

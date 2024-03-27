import { Render } from "./rich-text-editor/render-server"
import type { RichTextState } from "."

export const RichText = ({ state }: { state: RichTextState }) => {
  return <Render state={state} />
}

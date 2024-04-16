import { Div, Prose, PuckRichText } from "@oberoncms/components"
import { Image } from "@oberoncms/upload-thing"
import { type OberonConfig } from "@oberoncms/core"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    Image,
    Text: PuckRichText,
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

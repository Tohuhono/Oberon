import { Div, PuckRichText, Prose } from "@oberoncms/components"
import { Image } from "@oberoncms/upload-thing"
import type { OberonConfig } from "@oberoncms/core"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    PuckRichText,
    Image,
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

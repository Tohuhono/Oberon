import { Div, Prose, PuckRichText } from "@oberoncms/components"
import { Image } from "@oberoncms/upload-thing"
import { type OberonConfig } from "@oberoncms/core"
import { Dashboard } from "../../components/dashboard"

export const config: OberonConfig = {
  blocks: {
    Prose,
    Div,
    Image,
    Text: PuckRichText,
    Dashboard: {
      render: () => <Dashboard />,
    },
  },
  resolvePath: (path: string[] = []) => `/${path.join("/")}`,
}

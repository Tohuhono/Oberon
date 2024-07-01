import { type OberonConfig } from "@oberoncms/core"
import { Image } from "@oberoncms/plugin-uploadthing"
import exampleComponents from "@tohuhono/puck-blocks/example"

export const config: OberonConfig = {
  version: 1,
  components: {
    Image,
    ...exampleComponents,
  },
}

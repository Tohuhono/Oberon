import { type OberonConfig } from "@oberoncms/core"
import { Image } from "@oberoncms/plugin-uploadthing"
import { withExamples } from "@tohuhono/puck-blocks/example"

export const config: OberonConfig = withExamples({
  version: 1,
  components: {
    Image,
  },
})

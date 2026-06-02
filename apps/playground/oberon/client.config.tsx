import { type OberonClientConfig } from "@oberoncms/core"
import { Image } from "@oberoncms/plugin-uploadthing"
import { withExamples } from "@tohuhono/puck-blocks/example"

export const clientConfig: OberonClientConfig = withExamples({
  version: 1,
  components: {
    Image,
  },
})

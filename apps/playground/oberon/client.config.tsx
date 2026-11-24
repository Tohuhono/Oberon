import { type OberonClientConfig } from "@oberoncms/core"
import { withSharedComponents } from "@oberoncms/plugin-shared-components/config"
import { Image } from "@oberoncms/plugin-uploadthing"
import { withExamples } from "@tohuhono/puck-blocks/example"

export const clientConfig: OberonClientConfig = withSharedComponents(
  withExamples({
    version: 1,
    components: {
      Image,
    },
  }),
)

import type { OberonComponent, OberonImage } from "@oberoncms/core"

import { ImageField } from "./image-field"
import { Image as Base } from "./server"

export const Image: OberonComponent<{
  image: OberonImage | null
}> = {
  ...Base,
  fields: {
    image: {
      type: "custom",
      render: (props) => <ImageField {...props} />,
    },
  },
}

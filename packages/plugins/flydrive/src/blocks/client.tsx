import type { OberonComponent, OberonImage } from "@oberoncms/core"

import { ImageField } from "./image-field"
import { Image as Base } from "./server"

export const Image = {
  ...Base,
  fields: {
    image: {
      type: "custom",
      render: (props) => <ImageField {...props} />,
    },
  },
} satisfies OberonComponent<{
  image: OberonImage | null
}>

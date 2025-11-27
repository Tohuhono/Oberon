import type { OberonComponent, OberonImage } from "@oberoncms/core"
import { Image as Base } from "./server"
import { ImageField } from "./image-field"

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

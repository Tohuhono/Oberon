import type { OberonComponent, OberonImage } from "@oberoncms/core"
import { Image as Base } from "./server"
import { ImageField } from "./image-field"

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

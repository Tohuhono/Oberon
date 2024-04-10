import type { ComponentConfig } from "@measured/puck"
import { Image as Base, type OberonImage } from "./image"
import { ImageField } from "./image-field"

export const Image = {
  ...Base,
  fields: {
    image: {
      type: "custom",
      render: (props) => <ImageField {...props} />,
    },
  },
} satisfies ComponentConfig<{
  image: OberonImage
}>

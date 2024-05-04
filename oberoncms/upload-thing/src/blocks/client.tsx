import type { ComponentConfig } from "@measured/puck"
import type { OberonImage } from "@oberoncms/core"
import { Image as Base } from "./server"
import { ImageField } from "./image-field"

export const Image = {
  ...Base,
  fields: {
    oberon: {
      type: "custom",
      render: (props) => <ImageField {...props} />,
    },
  },
} satisfies ComponentConfig<{
  oberon: { image: OberonImage | null }
}>

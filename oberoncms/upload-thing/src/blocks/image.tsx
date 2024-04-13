import NextImage from "next/image"
import { ImageIcon } from "@radix-ui/react-icons"
import type { ComponentConfig } from "@measured/puck"
import type { OberonImage } from "@oberoncms/core"

export const Image = {
  fields: {
    oberon: {
      type: "custom",
      render: () => <></>, // only render on the client
    },
  },
  defaultProps: {
    oberon: {
      image: null,
    },
  },
  render: ({ oberon: { image } }) => {
    if (!image) {
      return <ImageIcon height={100} width={100} />
    }

    const { url, height, width, alt } = image
    return <NextImage src={url} height={height} width={width} alt={alt} />
  },
} satisfies ComponentConfig<{
  oberon: { image: OberonImage | null }
}>

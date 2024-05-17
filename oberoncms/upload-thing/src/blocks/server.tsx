import NextImage from "next/image"
import { ImageIcon } from "@radix-ui/react-icons"
import type { OberonComponent, OberonImage } from "@oberoncms/core"

export const Image = {
  fields: {
    image: {
      type: "custom",
      render: () => <></>, // only render on the client
    },
  },
  defaultProps: {
    image: null,
  },
  render: ({ image }) => {
    if (!image) {
      return <ImageIcon height={100} width={100} />
    }

    const { url, height, width, alt } = image
    return <NextImage src={url} height={height} width={width} alt={alt} />
  },
} satisfies OberonComponent<{
  image: OberonImage | null
}>

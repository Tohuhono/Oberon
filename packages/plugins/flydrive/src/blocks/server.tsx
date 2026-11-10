import type { OberonComponent, OberonImage } from "@oberoncms/core"
import { ImageIcon } from "@radix-ui/react-icons"
import NextImage from "next/image"

const EmptyImageField = () => null

export const Image = {
  fields: {
    image: {
      type: "custom",
      // only render on the client
      render: () => <EmptyImageField />,
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

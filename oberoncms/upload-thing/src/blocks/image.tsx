import NextImage from "next/image"
import { ImageIcon } from "@radix-ui/react-icons"
import type { ComponentConfig } from "@measured/puck"

export type OberonImage = {
  url: string
  height?: number
  width?: number
}

export const Image = {
  fields: {
    image: {
      type: "custom",
      render: () => <></>, // only render on the client
    },
  },
  defaultProps: {
    image: { url: "", width: 100, height: 100 },
  },
  render: ({ image: { url, height, width } }: { image: OberonImage }) => {
    if (!url) {
      return <ImageIcon height={height} width={width} />
    }
    return <NextImage src={url} height={height} width={width} alt="" />
  },
} satisfies ComponentConfig<{
  image: OberonImage
}>

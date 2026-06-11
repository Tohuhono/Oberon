"use client"

import { Image as UnpicImage, Source } from "@unpic/react"
import { createContext, useContext } from "react"

export type { ImageProps, SourceProps } from "@unpic/react"
import type { ImageProps } from "@unpic/react"

export type ImageTransform = Partial<
  Pick<
    ImageProps,
    | "background"
    | "breakpoints"
    | "cdn"
    | "fallback"
    | "objectFit"
    | "operations"
    | "options"
    | "priority"
    | "unstyled"
  >
>

export const ImageContext = createContext<ImageTransform | undefined>(undefined)

const useImageTransform = () => useContext(ImageContext)

export function Image(props: ImageProps) {
  const imageTransform = useImageTransform()

  return <UnpicImage {...imageTransform} {...props} />
}

export { Source }

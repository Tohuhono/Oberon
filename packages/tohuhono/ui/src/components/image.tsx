"use client"

import { Image as UnpicImage, Source } from "@unpic/react"
import { createContext, useContext, type PropsWithChildren } from "react"

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

const ImageTransformContext = createContext<ImageTransform | undefined>(undefined)

export function ImageTransformProvider({
  children,
  imageTransform,
}: PropsWithChildren<{ imageTransform?: ImageTransform }>) {
  return (
    <ImageTransformContext.Provider value={imageTransform}>
      {children}
    </ImageTransformContext.Provider>
  )
}

export const useImageTransform = () => useContext(ImageTransformContext)

export function Image(props: ImageProps) {
  const imageTransform = useImageTransform()

  return <UnpicImage {...imageTransform} {...props} />
}

export { Source }

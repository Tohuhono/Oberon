import { imageSize } from "image-size"

type ImageSize = { width: number; height: number }

export async function getImageSize(image: Buffer, defaultSize?: ImageSize): Promise<ImageSize> {
  const fallbackSize = defaultSize ?? { width: 100, height: 100 }

  try {
    const { width, height } = imageSize(image)
    if (width && height) {
      return { width, height }
    }
    return fallbackSize
  } catch (error) {
    return fallbackSize
  }
}

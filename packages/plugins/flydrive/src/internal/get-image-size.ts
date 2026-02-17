import { imageSize } from "image-size"

type ImageSize = { width: number; height: number }

export async function getImageSize(
  image: Buffer,
  defaultSize: ImageSize = { width: 100, height: 100 },
): Promise<ImageSize> {
  try {
    const { width, height } = imageSize(image)
    if (width && height) {
      return { width, height }
    }
    return defaultSize
  } catch (error) {
    return defaultSize
  }
}

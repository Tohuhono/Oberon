import { imageSize } from "image-size"

type ImageSize = { width: number; height: number }

export async function getImageSize(
  image: Buffer,
  defaultSize: ImageSize = { width: 100, height: 100 },
): Promise<ImageSize> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // This throws if it cannot determine the size
      const { width, height } = imageSize(image)
      if (width && height) {
        return { width, height }
      }
      // If the width or height are (probably incorrectly) zero, return the default
      return defaultSize
    } catch (error) {
      // Cannot determine the size yet
    }
  }
}

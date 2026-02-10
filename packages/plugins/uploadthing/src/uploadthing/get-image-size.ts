import { imageSize } from "image-size"

type ImageSize = { width: number; height: number }

// TODO change to iterable stream when supported https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#consuming_a_fetch_using_asynchronous_iteration
export async function getImageSize(
  url: string,
  defaultSize: ImageSize = { width: 100, height: 100 },
): Promise<ImageSize> {
  const chunks: Uint8Array[] = []
  const response = await fetch(url)
  if (!response.body) {
    throw new Error("Image not found for size processing")
  }
  const reader = response.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      return defaultSize
    }
    chunks.push(value)
    try {
      // This throws if it cannot determine the size
      const { width, height } = imageSize(Buffer.concat(chunks))
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

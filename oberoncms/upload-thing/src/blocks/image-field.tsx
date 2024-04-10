import { FieldLabel } from "@measured/puck"
import { imageSize } from "image-size"
import type { ISizeCalculationResult } from "image-size/types/interface"
import { useEffect, useState } from "react"
import type { OberonImage } from "./image"
import { UploadDropzone } from "@/uploadthing/components"

// TODO change to iterable stream when supported https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#consuming_a_fetch_using_asynchronous_iteration
async function getImageSize(url: string): Promise<ISizeCalculationResult> {
  const chunks: Uint8Array[] = []
  const response = await fetch(url)
  if (!response.body) {
    throw new Error("Image not found for size processing")
  }
  const reader = response.body.getReader()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      throw new Error("Unable to determine image dimensions")
    }
    chunks.push(value)
    try {
      return imageSize(Buffer.concat(chunks))
    } catch (error) {
      /* Not ready yet */
    }
  }
}

export const ImageField = ({
  value,
  onChange,
}: {
  value: OberonImage
  onChange: (image: OberonImage) => void
}) => {
  const [url, setUrl] = useState(value.url)
  const [width, setWidth] = useState(value.width || "")
  const [height, setHeight] = useState(value.height || "")

  useEffect(
    () => onChange({ url, width: Number(width), height: Number(height) }),
    [url, width, height, onChange],
  )

  useEffect(() => console.log("oh noes"), [onChange])

  return (
    <>
      <FieldLabel label="Width">
        <input
          value={width}
          onChange={(e) => {
            setWidth(e.currentTarget.value)
          }}
        />
      </FieldLabel>
      <FieldLabel label="Height">
        <input
          value={height}
          onChange={(e) => {
            setHeight(e.currentTarget.value)
          }}
        />
      </FieldLabel>
      <UploadDropzone
        endpoint="singleImageUploader"
        onClientUploadComplete={async (res) => {
          // Do something with the response
          if (res[0]) {
            //name: res[0].name,
            const url = res[0].url
            const { height, width } = await getImageSize(url)
            setUrl(url)
            setHeight(height || "")
            setWidth(width || "")
          }
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
        onUploadBegin={(name) => {
          // Do something once upload begins
          console.log("Uploading: ", name)
        }}
      />
    </>
  )
}

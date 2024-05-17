import { FieldLabel } from "@measured/puck"
import { useEffect, useState } from "react"
import { useOberonImages } from "@oberoncms/core/editor"
import type { OberonImage } from "@oberoncms/core"
import { UploadDropzone } from "../uploadthing/components"

const useImages = (
  value: OberonImage | null,
  onChange: (value: OberonImage | null) => void,
) => {
  const { images, loading, addImage } = useOberonImages()

  const [imageKey, setImageKey] = useState<OberonImage["key"] | "">(
    value?.key || "",
  )

  useEffect(() => {
    if (!imageKey) {
      return onChange(null)
    }

    onChange(images?.find((image) => image.key === imageKey) || null)
  }, [images, imageKey, onChange])

  return {
    images,
    loading,
    imageKey,
    setImageKey,
    addImage,
  }
}

export const ImageField = ({
  value,
  onChange,
}: {
  value: OberonImage | null
  onChange: (value: OberonImage | null) => void
}) => {
  const { images, loading, imageKey, setImageKey, addImage } = useImages(
    value,
    onChange,
  )

  return (
    <>
      <FieldLabel label="Image">
        <select value={imageKey} onChange={(e) => setImageKey(e.target.value)}>
          <option value="">
            {loading ? "Loading Images" : "Select an image"}
          </option>
          {images?.map(({ key, alt }) => (
            <option key={key} value={key}>
              {alt}
            </option>
          ))}
        </select>
      </FieldLabel>
      <UploadDropzone
        endpoint="singleImageUploader"
        onClientUploadComplete={async (res) => {
          if (!res[0]) {
            return
          }
          const {
            key,
            name,
            size,
            url,
            serverData: { width, height },
          } = res[0]

          addImage({
            key,
            url,
            alt: name,
            size,
            width,
            height,
            updatedAt: new Date(),
            updatedBy: "unknown",
          })
          setImageKey?.(key || "")
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </>
  )
}

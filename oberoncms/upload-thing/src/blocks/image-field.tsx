import { FieldLabel } from "@measured/puck"
import { useEffect, useState } from "react"
import { useOberonImages } from "@oberoncms/core/editor"
import type { OberonImage } from "@oberoncms/core"
import { UploadDropzone } from "@/uploadthing/components"

export const ImageField = ({
  value,
  onChange,
}: {
  value: OberonImage | null
  onChange: (value: { image: OberonImage | null }) => void
}) => {
  const { images, loading, add } = useOberonImages()

  const [imageKey, setImageKey] = useState<OberonImage["key"] | "">(
    value?.key || "",
  )

  useEffect(() => {
    if (!imageKey) {
      return onChange({ image: null })
    }
    onChange({ image: images?.find((image) => image.key === imageKey) || null })
  }, [images, imageKey, onChange])

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

          add({ key, url, alt: name, size, width, height })
          setImageKey?.(key || "")
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </>
  )
}

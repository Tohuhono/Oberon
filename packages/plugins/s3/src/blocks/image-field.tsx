import { FieldLabel } from "@measured/puck"
import { useCallback, useEffect, useState } from "react"
import { useOberonImages } from "@oberoncms/core/editor"
import type { OberonImage } from "@oberoncms/core"
import { useDropzone } from "react-dropzone"
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !acceptedFiles[0]) return

    const file = acceptedFiles[0]

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/s3", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { key, alt, size, url, width, height } = await response.json()

        addImage({
          key,
          url,
          alt,
          size,
          width,
          height,
          updatedAt: new Date(),
          updatedBy: "unknown",
        })

        setImageKey(key)
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      if (error instanceof Error) alert(`ERROR! ${error.message}`)
      else {
        alert("An unknown error occurred")
        console.error(error)
      }
    }
  }, [])
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/heic": [],
      "image/jfif": [],
    },
    multiple: false,
  })

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
      <div {...getRootProps()}>
        <input {...getInputProps({ disabled: loading })} />
        <p>Drag and drop your files here, or click to select files</p>
      </div>
    </>
  )
}

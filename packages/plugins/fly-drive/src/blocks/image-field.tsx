import { FieldLabel } from "@measured/puck"
import type { OberonImage } from "@oberoncms/core"
import { useOberonImages } from "@oberoncms/core/editor"
import { useCallback, useEffect, useState } from "react"
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
  const { images, loading, setImageKey, addImage } = useImages(value, onChange)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length && acceptedFiles[0]) {
        const file = acceptedFiles[0]

        const formData = new FormData()
        formData.append("image", file)

        try {
          const response = await fetch("/api/flydrive", {
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
          if (error instanceof Error) {
            alert(`ERROR! ${error.message}`)
          } else {
            alert("An unknown error occurred")
            console.error(error)
          }
        }
      }
    },
    [setImageKey, addImage],
  )
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

  const [pickerVisible, setPickerVisible] = useState(false)
  return (
    <div>
      <FieldLabel label="Image" />
      <button
        className="inline-flex w-full items-center text-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 justify-center rounded-md px-2 text-xs"
        onClick={() => setPickerVisible((visible) => !visible)}
        disabled={loading}
      >
        Toggle Picker
      </button>
      {!pickerVisible && (
        <div {...getRootProps({ className: "mt-2" })}>
          <input {...getInputProps({ disabled: loading })} />
          <div className="bg-primary-foreground p-8 text-center rounded-lg border-dashed border-2 border-muted hover:border-primary transition duration-300 ease-in-out">
            <span className="cursor-pointer flex flex-col items-center space-y-2">
              <svg
                className="w-16 h-16 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              <span className="text-muted-foreground">
                Drag and drop your image here
              </span>
              <span className="text-muted-foreground text-sm">
                (or click to select)
              </span>
            </span>
          </div>
        </div>
      )}
      {pickerVisible && (
        <div className="mt-2 h-96 overflow-hidden">
          <div className="grid grid-cols-1 gap-4 w-full h-full overflow-y-auto">
            {images?.map(({ key, url, alt }) => (
              <div
                aria-label="image"
                className="bg-white border border-gray-300 p-4 rounded-lg overflow-hidden shadow-md relative w-full h-48 cursor-pointer"
                key={key}
                onClick={() => {
                  setImageKey(key)
                  setPickerVisible(false)
                }}
              >
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

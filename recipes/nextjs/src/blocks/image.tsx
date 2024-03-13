import { ComponentConfig } from "@measured/puck"
import NextImage from "next/image"
import { UploadDropzone } from "src/uploadthing/components"

export const Image: ComponentConfig<{
  image: {
    url: string
  }
}> = {
  fields: {
    image: {
      type: "custom",
      render: ({ value, onChange, name }) => {
        return (
          <>
            {`Name: ${name} Value: ${value.url}`}
            <UploadDropzone
              endpoint="singleImageUploader"
              onClientUploadComplete={(res) => {
                // Do something with the response
                if (res) {
                  //name: res[0].name,
                  onChange({ url: res[0].url })
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
      },
    },
  },
  defaultProps: {
    image: { url: "" },
  },
  render: ({ image: { url } }) => {
    return <NextImage src={url} alt="" fill />
  },
}

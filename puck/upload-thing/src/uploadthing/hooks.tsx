import { generateReactHelpers } from "@uploadthing/react/hooks"

const helpers = generateReactHelpers()

export const useUploadThing: ReturnType<
  typeof generateReactHelpers
>["useUploadThing"] = helpers.useUploadThing
export const uploadFiles: ReturnType<
  typeof generateReactHelpers
>["uploadFiles"] = helpers.uploadFiles

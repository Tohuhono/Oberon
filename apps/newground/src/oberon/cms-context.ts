import { OberonClientContextRequestSchema } from "@oberoncms/core"
import { getOberonClientContext } from "@oberoncms/core/provider"
import { createServerFn } from "@tanstack/react-start"

export const getCmsContext = createServerFn({ method: "GET" })
  .validator(OberonClientContextRequestSchema)
  .handler(async ({ data }) => {
    const { adapter } = await import("./adapter")

    return await getOberonClientContext({
      adapter,
      path: data.path,
      searchParams: data.searchParams,
    })
  })

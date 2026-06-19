import type { OberonClientContext } from "@oberoncms/core"
import { createClientOnlyFn, createServerFn } from "@tanstack/react-start"
import { lazy, Suspense, useEffect, useState } from "react"

const loadCmsClient = createClientOnlyFn(() =>
  import("./cms.client").then((module) => ({ default: module.CmsClient })),
)

const CmsClient = lazy(loadCmsClient)

export function Cms(props: { context: OberonClientContext }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Suspense fallback={null}>
      <CmsClient {...props} />
    </Suspense>
  )
}

export type CmsSearchParams = { [key: string]: string | string[] | undefined }

export function validateCmsSearch(search: Record<string, unknown>): CmsSearchParams {
  const token = typeof search.token === "string" ? search.token : undefined

  return {
    callbackUrl: typeof search.callbackUrl === "string" ? search.callbackUrl : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
    token: token ?? (typeof search.token === "number" ? String(search.token) : undefined),
  }
}

export const getCmsContext = createServerFn({ method: "GET" })
  .validator((data: { path: string[]; searchParams: CmsSearchParams }) => data)
  .handler(async ({ data }) => {
    const { resolveOberonClientContext } = await import("@oberoncms/core/provider")
    const { adapter } = await import("./adapter")

    return await resolveOberonClientContext({
      adapter,
      path: data.path,
      searchParams: data.searchParams,
    })
  })

import type { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { OberonClientProvider } from "./components/provider"
import type {
  ClientAction,
  OberonAdapter,
  OberonClientContext,
  OberonServerActions,
} from "./lib/dtd"
import { parseClientAction, resolveSlug } from "./lib/utils"

async function getContext(
  {
    getPageData,
    getAllImages,
    getAllPages,
    getAllUsers,
    getConfig,
  }: OberonAdapter,
  action: ClientAction,
  slug: string,
  searchParams: { [key: string]: string | string[] | undefined },
): Promise<OberonClientContext> {
  switch (action) {
    case "login":
      return {
        action,
        slug,
        data: {
          callbackUrl:
            typeof searchParams.callbackUrl === "string"
              ? searchParams.callbackUrl
              : "",
          email:
            typeof searchParams.email === "string" ? searchParams.email : "",
          token:
            typeof searchParams.token === "string" ? searchParams.token : "",
        },
      }
    case "edit":
    case "preview":
      return {
        action,
        slug,
        data: await getPageData(slug),
      }
    case "users":
      return {
        action,
        slug,
        data: await getAllUsers(),
      }
    case "images":
      return {
        action,
        slug,
        data: await getAllImages(),
      }
    case "site":
      return {
        action,
        slug,
        data: await getConfig(),
      }
    case "pages":
      return {
        action,
        slug,
        data: await getAllPages(),
      }
  }
}

export async function OberonProvider({
  children,
  adapter,
  actions,
  path,
  searchParams,
}: PropsWithChildren<{
  adapter: OberonAdapter
  actions: OberonServerActions
  path: string[]
  searchParams: { [key: string]: string | string[] | undefined }
}>) {
  const action = parseClientAction(path[0])

  const slug = resolveSlug(path.slice(1))

  const loggedIn = await adapter.can("site")

  if (!loggedIn && action !== "login") {
    redirect(`/cms/login?callbackUrl=/cms/${path.join("/")}`)
  }

  const context = await getContext(adapter, action, slug, searchParams)

  return (
    <OberonClientProvider serverActions={actions} context={context}>
      {children}
    </OberonClientProvider>
  )
}

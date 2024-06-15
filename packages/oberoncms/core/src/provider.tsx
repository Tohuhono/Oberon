import type { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { OberonClientProvider } from "./components/provider"
import type {
  ClientAction,
  OberonClientContext,
  OberonServerActions,
} from "./lib/dtd"
import { parseClientAction, resolveSlug, unwrap } from "./lib/utils"

async function getContext(
  {
    getPageData,
    getAllImages,
    getAllPages,
    getAllUsers,
    getConfig,
  }: OberonServerActions,
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
        data: await unwrap(getPageData(slug)),
      }
    case "users":
      return {
        action,
        slug,
        data: await unwrap(getAllUsers()),
      }
    case "images":
      return {
        action,
        slug,
        data: await unwrap(getAllImages()),
      }
    case "site":
      return {
        action,
        slug,
        data: await unwrap(getConfig()),
      }
    case "pages":
      return {
        action,
        slug,
        data: await unwrap(getAllPages()),
      }
  }
}

export async function OberonProvider({
  children,
  actions,
  path,
  searchParams,
}: PropsWithChildren<{
  actions: OberonServerActions
  path: string[]
  searchParams: { [key: string]: string | string[] | undefined }
}>) {
  const action = parseClientAction(path[0])

  const slug = resolveSlug(path.slice(1))

  const loggedIn = await actions.can("site")

  if (!loggedIn && action !== "login") {
    redirect("/cms/login")
  }

  const context = await getContext(actions, action, slug, searchParams)

  return (
    <OberonClientProvider serverActions={actions} context={context}>
      {children}
    </OberonClientProvider>
  )
}

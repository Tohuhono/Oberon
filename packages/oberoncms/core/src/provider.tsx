import type { PropsWithChildren } from "react"

import { OberonClientProvider } from "./components/provider"
import type { ClientAction, OberonServerActions } from "./lib/dtd"
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
) {
  switch (action) {
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
}: PropsWithChildren<{ actions: OberonServerActions; path: string[] }>) {
  const action = parseClientAction(path[0])
  const slug = resolveSlug(path.slice(1))

  const context = await getContext(actions, action, slug)

  return (
    <OberonClientProvider serverActions={actions} context={context}>
      {children}
    </OberonClientProvider>
  )
}

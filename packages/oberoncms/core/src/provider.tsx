import type { PropsWithChildren } from "react"

import { OberonClientProvider } from "./components/provider"
import type { ClientAction, OberonActions } from "./app/schema"
import { parseClientAction, resolveSlug } from "./app/utils"

async function getContext(
  {
    getPageData,
    getAllImages,
    getAllPages,
    getAllUsers,
    getConfig,
  }: OberonActions,
  action: ClientAction,
  slug: string,
) {
  switch (action) {
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
  actions,
  path,
}: PropsWithChildren<{ actions: OberonActions; path: string[] }>) {
  const action = parseClientAction(path[0])
  const slug = resolveSlug(path.slice(1))

  const context = await getContext(actions, action, slug)

  return (
    <OberonClientProvider actions={actions} context={context}>
      {children}
    </OberonClientProvider>
  )
}

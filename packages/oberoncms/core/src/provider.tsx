import { type PropsWithChildren } from "react"

import { OberonClientProvider } from "./components/provider"
import type {
  AdapterActionGroup,
  ClientAction,
  OberonAdapter,
  OberonClientContext,
  OberonClientContextRequest,
  OberonQueryParams,
  OberonServerActions,
} from "./lib/dtd"
import { ResponseError } from "./lib/dtd"
import { getSharedComponentRecords, getSharedComponentLibrary } from "./lib/shared-components"
import { parseClientAction, resolveSlug } from "./lib/utils"

function pageEditorReturnPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\/cms\/edit\/(?:[0-9a-zA-Z_.-]+(?:\/[0-9a-zA-Z_.-]+)*)?$/u.test(value)
  ) {
    return null
  }

  return value.split("/").some((segment) => segment === "." || segment === "..") ? null : value
}

async function getContext(
  { getComponent, getAllImages, listComponents, getAllUsers, getConfig }: OberonAdapter,
  action: ClientAction,
  slug: string,
  searchParams: OberonQueryParams,
): Promise<OberonClientContext> {
  switch (action) {
    case "login":
      return {
        action,
        slug,
        data: {
          callbackUrl: typeof searchParams.callbackUrl === "string" ? searchParams.callbackUrl : "",
          email: typeof searchParams.email === "string" ? searchParams.email : "",
          token: typeof searchParams.token === "string" ? searchParams.token : "",
        },
      }
    case "edit":
    case "preview": {
      const component = await getComponent({ key: slug })
      return {
        action,
        slug,
        data: component?.type === "page" ? component.data : null,
        updatedAt: component?.updatedAt ?? null,
        sharedComponents: await getSharedComponentLibrary({ listComponents, getComponent }),
      }
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
        data: await listComponents("page"),
      }
    case "library":
      return {
        action,
        slug,
        data: {
          sources: await getSharedComponentRecords({ listComponents, getComponent }),
          sourceId: typeof searchParams.source === "string" ? searchParams.source : null,
          returnTo: pageEditorReturnPath(searchParams.returnTo),
        },
      }
  }
}

function getActionGroup(action: Exclude<ClientAction, "login">): AdapterActionGroup {
  if (action === "edit" || action === "preview") {
    return "pages"
  }
  if (action === "library") {
    return "pages"
  }
  return action
}

export async function OberonProvider({
  children,
  adapter,
  actions,
  path,
  searchParams,
  ClientProvider = OberonClientProvider,
}: PropsWithChildren<{
  adapter: OberonAdapter
  actions: OberonServerActions
  path: string[]
  searchParams: OberonQueryParams
  ClientProvider?: typeof OberonClientProvider
}>) {
  const context = await getOberonClientContext({ adapter, path, searchParams })

  return (
    <ClientProvider serverActions={actions} context={context}>
      {children}
    </ClientProvider>
  )
}

export async function getOberonClientContext({
  adapter,
  path,
  searchParams,
}: OberonClientContextRequest & { adapter: OberonAdapter }) {
  const action = parseClientAction(path[0])

  if (!action) {
    if (path[0] === undefined) {
      return adapter.redirect({ href: "/cms/pages" })
    }

    return adapter.notFound()
  }

  const slug = resolveSlug(path.slice(1))

  const loggedIn = await adapter.can({ action: "site" })

  if (!loggedIn && action !== "login") {
    return adapter.redirect({ href: `/cms/login?callbackUrl=/cms/${path.join("/")}` })
  }

  if (action !== "login" && !(await adapter.can({ action: getActionGroup(action) }))) {
    throw new ResponseError("You do not have permission to perform this action")
  }

  return await getContext(adapter, action, slug, searchParams)
}

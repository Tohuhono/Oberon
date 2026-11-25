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
import { getSharedComponentFragments, getSharedComponentLibrary } from "./lib/shared-components"
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
  { getFragmentData, getAllImages, getAllFragments, getAllUsers, getConfig }: OberonAdapter,
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
      const fragment = await getFragmentData({ key: slug })
      return {
        action,
        slug,
        data: fragment?.type === "page" ? fragment.data : null,
        updatedAt: fragment?.updatedAt ?? null,
        sharedComponents: await getSharedComponentLibrary({ getAllFragments, getFragmentData }),
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
        data: await getAllFragments("page"),
      }
    case "library":
      return {
        action,
        slug,
        data: {
          sources: await getSharedComponentFragments({ getAllFragments, getFragmentData }),
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

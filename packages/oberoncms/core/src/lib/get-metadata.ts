import type { OberonAdapter, PageData } from "./dtd"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

export function getPageMetadata(data?: PageData, fallback = "Oberon CMS") {
  return { title: data?.root.props?.title || data?.root.title || fallback }
}

export async function getMetaData(
  { getComponent }: OberonAdapter,
  path: string | string[] = [],
  action?: string,
) {
  const slug = resolveSlug(path)

  if (action) {
    const clientAction = parseClientAction(action)

    return {
      title: clientAction ? getTitle(clientAction, slug) : "Oberon CMS",
    }
  }

  const component = await getComponent({ key: typeof path === "string" ? path : slug })

  return component?.type === "shared"
    ? getPageMetadata(component.data.tree, component.data.name)
    : getPageMetadata(component?.data)
}

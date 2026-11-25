import type { OberonAdapter, PageData } from "./dtd"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

export function getPageMetadata(data?: PageData) {
  return { title: data?.root.props?.title || data?.root.title || "Oberon CMS" }
}

export async function getMetaData(
  { getFragmentData }: OberonAdapter,
  path: string[] = [],
  action?: string,
) {
  const slug = resolveSlug(path)

  if (action) {
    const clientAction = parseClientAction(action)

    return {
      title: clientAction ? getTitle(clientAction, slug) : "Oberon CMS",
    }
  }

  const fragment = await getFragmentData({ key: slug })

  return getPageMetadata(fragment?.type === "page" ? fragment.data : undefined)
}

import type { OberonAdapter } from "./dtd"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

export async function getMetaData(
  { getPageData }: OberonAdapter,
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

  const data = await getPageData(slug)

  return {
    title: data?.root.title || "Oberon CMS",
  }
}

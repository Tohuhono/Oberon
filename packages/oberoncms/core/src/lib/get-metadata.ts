import type { OberonAdapter } from "./dtd"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

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

  const data = await getFragmentData({ key: slug, type: "page" })

  return {
    title: data?.root.props?.title || data?.root.title || "Oberon CMS",
  }
}

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

  const fragment = await getFragmentData({ key: slug, type: "page" })

  return {
    title: fragment?.type === "page" ? fragment.data.root.title || "Oberon CMS" : "Oberon CMS",
  }
}

import type { OberonAdapter } from "./dtd"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

export async function getMetaData(
  { getComponent }: OberonAdapter,
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

  const component = await getComponent({ key: slug })

  return {
    title: component?.data.root.props?.title || component?.data.root.title || "Oberon CMS",
  }
}

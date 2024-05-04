import type { Metadata } from "next"
import type { OberonAdapter } from "./schema"
import { getTitle, parseClientAction, resolveSlug } from "./utils"

export async function getMetaData(
  { getPageData }: OberonAdapter,
  path: string[] = [],
  action?: string,
): Promise<Metadata> {
  const slug = resolveSlug(path)

  if (action) {
    return {
      title: getTitle(parseClientAction(action), slug),
    }
  }

  const data = await getPageData(slug)

  return {
    title: data?.root.title || "Oberon CMS",
  }
}

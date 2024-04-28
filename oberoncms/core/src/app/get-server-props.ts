import type { OberonConfig, OberonServerActions } from "./schema"
import { parseClientAction } from "./utils"

export async function getServerProps(
  { resolvePath }: OberonConfig,
  { getPageData, getAllImages, getAllPages, getAllUsers }: OberonServerActions,
  maybeAction: string,
  path: string[] = [],
) {
  const action = parseClientAction(maybeAction)

  const slug = resolvePath(path)

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
    case "pages":
      return {
        action,
        slug,
        data: await getAllPages(),
      }
  }
}

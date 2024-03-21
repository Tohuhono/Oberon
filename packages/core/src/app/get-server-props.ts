import type { OberonConfig, ServerActions } from "./schema"
import { parseClientAction } from "./utils"

export async function getServerProps(
  { resolvePath }: OberonConfig,
  { getPageData, getAllAssets, getAllKeys, getAllUsers }: ServerActions,
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
    case "assets":
      return {
        action,
        slug,
        data: await getAllAssets(),
      }
    case "pages":
      return {
        action,
        slug,
        data: await getAllKeys(),
      }
  }
}

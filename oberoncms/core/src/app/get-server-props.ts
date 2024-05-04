import type { ClientAction, OberonActions } from "./schema"

export async function getServerProps(
  { getPageData, getAllImages, getAllPages, getAllUsers }: OberonActions,
  action: ClientAction,
  slug: string,
) {
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

import type { ClientAction } from "./schema"

export function getTitle(action: ClientAction, slug?: string) {
  switch (action) {
    case "edit":
      return "Editing: " + slug
    case "preview":
      return "Previewing: " + slug
    case "assets":
      return "Manage Assets"
    case "users":
      return "Manage Users"
    case "pages":
    default:
      return "Oberon CMS"
  }
}

export const parseClientAction = (action: unknown): ClientAction => {
  switch (action) {
    case "edit":
    case "preview":
    case "users":
    case "assets":
    case "pages":
      return action
    default:
      throw new Error("No maching client action")
  }
}

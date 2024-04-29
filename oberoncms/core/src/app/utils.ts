import { notFound } from "next/navigation"
import type { ClientAction } from "./schema"

export function getTitle(action: ClientAction, slug?: string) {
  switch (action) {
    case "edit":
      return "Editing: " + slug
    case "preview":
      return "Previewing: " + slug
    case "images":
      return "Manage Assets"
    case "users":
      return "Manage Users"
    case "pages":
    default:
      return "Oberon CMS Pages"
  }
}

export const parseClientAction = (action: unknown): ClientAction => {
  switch (action) {
    case "edit":
    case "preview":
    case "users":
    case "images":
    case "pages":
      return action
    default:
      return notFound()
  }
}

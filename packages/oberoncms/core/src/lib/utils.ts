import { notFound } from "next/navigation"
import type { ClientAction } from "./dtd"

export function getTitle(action: ClientAction, slug?: string) {
  switch (action) {
    case "edit":
      return `Editing: ${slug}`
    case "preview":
      return `Previewing: ${slug}`
    case "images":
      return "Manage Images"
    case "users":
      return "Manage Users"
    case "pages":
      return "Manage Pages"
    case "site":
    default:
      return "Oberon CMS"
  }
}

export const parseClientAction = (action: unknown): ClientAction => {
  switch (action) {
    case undefined:
      return "site"
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

export const resolveSlug = (path: string[] = []) => `/${path.join("/")}`

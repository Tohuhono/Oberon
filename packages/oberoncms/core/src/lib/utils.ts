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

const resolveDevEnv = (value?: string) => {
  switch (value) {
    case "true":
      return true
    case "false":
      return false
    default:
      return process.env.NODE_ENV === "development" && !process.env.CI
  }
}

export const USE_DEVELOPMENT_DATABASE_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_DATABASE,
)

export const USE_DEVELOPMENT_SEND_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_SEND,
)

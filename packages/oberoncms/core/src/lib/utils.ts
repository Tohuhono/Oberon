import { NotImplementedError, type ClientAction } from "./dtd"

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

export const parseClientAction = (action: unknown): ClientAction | undefined => {
  switch (action) {
    case "edit":
    case "images":
    case "login":
    case "pages":
    case "preview":
    case "site":
    case "users":
      return action
    default:
      return undefined
  }
}

export const resolveSlug = (path: string | string[] = "") => {
  const slug = typeof path === "string" ? path : path.join("/")
  return slug.startsWith("/") ? slug : `/${slug}`
}

const resolveDevEnv = (value?: string) => {
  switch (value) {
    case "true":
      return true
    case "false":
      return false
    default:
      return !process.env.CI && (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  }
}

export const USE_DEVELOPMENT_DATABASE_PLUGIN = resolveDevEnv(process.env.USE_DEVELOPMENT_DATABASE)

export const USE_DEVELOPMENT_SEND_PLUGIN = resolveDevEnv(process.env.USE_DEVELOPMENT_SEND)

export function notImplemented(action: string) {
  return (): never => {
    throw new NotImplementedError(
      `No oberon plugin provided for ${action} action, please check your oberon adapter configuration.`,
    )
  }
}

export function isValidKey<TObj extends object>(key: PropertyKey, obj: TObj): key is keyof TObj {
  return key in obj
}

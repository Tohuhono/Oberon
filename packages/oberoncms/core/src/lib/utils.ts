import { notFound, redirect } from "next/navigation"

import { isRedirectError } from "next/dist/client/components/redirect-error"
import { ResponseError, type ClientAction, type OberonResponse } from "./dtd"

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
    case "edit":
    case "images":
    case "login":
    case "pages":
    case "preview":
    case "site":
    case "users":
      return action
    case undefined:
      return redirect("/cms/pages")
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
      return (
        !process.env.CI &&
        (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
      )
  }
}

export const USE_DEVELOPMENT_DATABASE_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_DATABASE,
)

export const USE_DEVELOPMENT_SEND_PLUGIN = resolveDevEnv(
  process.env.USE_DEVELOPMENT_SEND,
)

export function notImplemented(action: string) {
  return (): never => {
    throw new ResponseError(
      `No oberon plugin provided for ${action} action, please check your oberon adapter configuration.`,
    )
  }
}

export async function wrap<T>(promise: Promise<T>): OberonResponse<T> {
  try {
    return {
      status: "success",
      result: await promise,
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    if (error instanceof ResponseError) {
      return {
        status: "error",
        message: error.message,
      }
    }
    return {
      status: "error",
    }
  }
}

import { isRedirectError } from "next/dist/client/components/redirect-error.js"
import {
  USE_DEVELOPMENT_DATABASE_PLUGIN,
  USE_DEVELOPMENT_SEND_PLUGIN,
} from "../env"
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

export const resolveSlug = (path: string[] = []) => `/${path.join("/")}`

export { USE_DEVELOPMENT_DATABASE_PLUGIN, USE_DEVELOPMENT_SEND_PLUGIN }

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

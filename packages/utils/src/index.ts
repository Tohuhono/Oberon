import type { PropsWithChildren } from "react"
import { ClassNameValue, twMerge } from "tailwind-merge"

export type CNProps<T = unknown> = PropsWithChildren<T & { className?: string }>
export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs)
}

export function getTitle(route: string, path?: string) {
  switch (route) {
    case "edit":
      return "Editing: " + path
    case "preview":
      return "Previewing: " + path
    case "assets":
      return "Manage Assets"
    case "users":
      return "Manage Users"
    case "pages":
    default:
      return "Oberon CMS"
  }
}

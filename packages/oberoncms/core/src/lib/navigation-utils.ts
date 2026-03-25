import { notFound, redirect } from "next/navigation"

import type { ClientAction } from "./dtd"

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

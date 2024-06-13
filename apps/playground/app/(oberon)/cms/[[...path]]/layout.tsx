import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { actions } from "@/oberon/actions"

export default async function PuckLayout({ children }: PropsWithChildren) {
  if (await actions.can("site")) {
    return children
  }

  redirect("/api/auth/signin")
}

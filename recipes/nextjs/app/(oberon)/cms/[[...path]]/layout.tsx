import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { actions } from "@/app/(oberon)/actions"

export default async function PuckLayout({ children }: PropsWithChildren) {
  if (await actions.can("site")) {
    return children
  }

  return redirect("/api/auth/signin")
}

import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { adapter } from "@/app/(oberon)/adapter"

export default async function PuckLayout({ children }: PropsWithChildren) {
  if (await adapter.can("site")) {
    return children
  }

  return redirect("/api/auth/signin")
}

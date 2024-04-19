import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { adapter } from "@oberoncms/adapter-turso"

export default async function PuckLayout({ children }: PropsWithChildren) {
  if (await adapter.can("cms")) {
    return children
  }

  return redirect("/api/auth/signin")
}

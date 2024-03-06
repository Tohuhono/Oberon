import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { PuckProviders } from "@/puck/src/providers"
import { auth } from "@/puck/src/auth/auth"

export async function PuckLayout({ children }: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    console.log("hmmm", session)
    redirect("/api/auth/signin")
  }

  return <PuckProviders>{children}</PuckProviders>
}

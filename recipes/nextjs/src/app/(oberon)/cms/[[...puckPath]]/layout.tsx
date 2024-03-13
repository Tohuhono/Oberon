import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { AuthProviders } from "src/auth/providers"
import { auth } from "src/auth/next-auth"

export default async function PuckLayout({ children }: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  return <AuthProviders>{children}</AuthProviders>
}

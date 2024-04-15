import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { AuthProvider } from "@oberoncms/auth/provider"
import { auth } from "@/app/(oberon)/server-config"

export default async function PuckLayout({ children }: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  // TODO auth: should not need this
  return <AuthProvider>{children}</AuthProvider>
}

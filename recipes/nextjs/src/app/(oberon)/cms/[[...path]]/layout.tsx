import { PropsWithChildren } from "react"

import { redirect } from "next/navigation"
import { AuthProvider } from "@oberon/auth/provider"
import { auth } from "@/app/(oberon)/server-config"

export default async function PuckLayout({ children }: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  return <AuthProvider>{children}</AuthProvider>
}

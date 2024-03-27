"use client"

import { PropsWithChildren } from "react"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>
}

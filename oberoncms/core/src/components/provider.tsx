"use client"

import { createContext, type PropsWithChildren } from "react"
import type { OberonActions, OberonClientContext } from "../app/schema"

export const OberonContext = createContext<{
  actions: OberonActions
  context: OberonClientContext
} | null>(null)

export const OberonClientProvider = ({
  children,
  actions,
  context,
}: PropsWithChildren<{
  actions: OberonActions
  context: OberonClientContext
}>) => {
  return (
    <OberonContext.Provider value={{ actions, context }}>
      {children}
    </OberonContext.Provider>
  )
}

"use client"

import { createContext, type PropsWithChildren } from "react"
import type { OberonActions, OberonClientContext } from "../lib/dtd"

export const ClientContext = createContext<OberonClientContext | null>(null)

export const ActionsContext = createContext<OberonActions | null>(null)

export const OberonClientProvider = ({
  children,
  actions,
  context,
}: PropsWithChildren<{
  actions: OberonActions
  context: OberonClientContext
}>) => {
  return (
    <ActionsContext.Provider value={actions}>
      <ClientContext.Provider value={context}>
        {children}
      </ClientContext.Provider>
    </ActionsContext.Provider>
  )
}

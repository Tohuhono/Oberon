"use client"

import { createContext, useMemo, type PropsWithChildren } from "react"
import { Toaster, useToast } from "@tohuhono/ui/toast"
import type {
  OberonActions,
  OberonClientContext,
  OberonServerActions,
} from "../lib/dtd"

export const ClientContext = createContext<OberonClientContext | null>(null)

export const ActionsContext = createContext<OberonActions | null>(null)

export const OberonClientProvider = ({
  children,
  serverActions,
  context,
}: PropsWithChildren<{
  serverActions: OberonServerActions
  context: OberonClientContext
}>) => {
  const { toast } = useToast()

  const actions = useMemo(() => {
    const actions = {} as OberonActions

    for (const key in serverActions) {
      // @ts-expect-error TODO fix this; it's too hard
      actions[key] = async (...props) => {
        // @ts-expect-error TODO fix this; it's too hard
        const { status, result, message } = await serverActions[key](...props)

        if (message) {
          toast({
            variant: status === "error" ? "destructive" : "default",
            title: message,
          })
        }

        return result
      }
    }

    return actions
  }, [serverActions, toast])

  return (
    <ActionsContext.Provider value={actions}>
      <ClientContext.Provider value={context}>
        {children}
        <Toaster />
      </ClientContext.Provider>
    </ActionsContext.Provider>
  )
}

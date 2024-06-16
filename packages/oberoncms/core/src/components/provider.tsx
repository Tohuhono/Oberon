"use client"

import { createContext, useMemo, type PropsWithChildren } from "react"
import { Toaster, useToast } from "@tohuhono/ui/toast"
import type {
  OberonAdapter,
  OberonClientContext,
  OberonResponse,
  OberonServerActions,
} from "../lib/dtd"

export const ClientContext = createContext<OberonClientContext | null>(null)

export const ActionsContext = createContext<OberonAdapter | null>(null)

type UnwrapServerAction = <TProps = unknown, TResult = unknown>(
  action: (...props: TProps[]) => OberonResponse<TResult>,
) => (...props: TProps[]) => Promise<TResult>

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
    const unwrap: UnwrapServerAction =
      (action) =>
      async (...props) => {
        const response = await action(...props)

        if (response?.message) {
          toast({
            variant: response.status === "error" ? "destructive" : "default",
            title: response.message,
          })
        }

        if (response?.status === "success") {
          return response.result
        }

        throw new Error(response?.message)
      }

    return Object.fromEntries(
      Object.entries(serverActions).map(([key, action]) => [
        key,
        unwrap(action),
      ]),
    ) as OberonAdapter
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

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

type UnwrapServerAction = <TProps = unknown, TResult = unknown, TKey = string>(
  serverActionEntry: [TKey, (...props: TProps[]) => OberonResponse<TResult>],
) => [TKey, (...props: TProps[]) => Promise<TResult>]

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
    const unwrap: UnwrapServerAction = ([key, action]) => [
      key,
      async (...props) => {
        const response = await action(...props)

        if (response?.message) {
          console.log("gotta message", response?.message)
          toast({
            variant: response.status === "error" ? "destructive" : "default",
            title: response.message,
          })
        }

        if (response?.status === "success") {
          if ((response.result as { message: string })?.message) {
            toast({
              title: (response.result as { message: string }).message,
            })
          }
          return response.result
        }

        if (response?.status === "error") {
          throw new Error(
            response?.message || `${key}: An unknown error has occured`,
          )
        }

        return response
      },
    ]

    return Object.fromEntries(
      Object.entries(serverActions).map(unwrap),
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

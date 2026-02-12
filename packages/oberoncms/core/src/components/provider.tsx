"use client"

import { createContext, useMemo, type PropsWithChildren } from "react"
import { Toaster, toast } from "@tohuhono/ui/toast"
import type {
  OberonClientContext,
  OberonResponse,
  OberonServerActions,
} from "../lib/dtd"

export const ClientContext = createContext<OberonClientContext | null>(null)

type UnwrappedResult<TResponse> =
  Awaited<TResponse> extends {
    result?: infer TResult
  }
    ? TResult
    : never

type OberonClientActions = {
  [Key in keyof OberonServerActions]: (
    ...props: Parameters<OberonServerActions[Key]>
  ) => Promise<UnwrappedResult<ReturnType<OberonServerActions[Key]>>>
}

export const ActionsContext = createContext<OberonClientActions | null>(null)

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  )
}

function unwrapServerAction<TProps extends unknown[], TResult>(
  key: keyof OberonServerActions,
  action: (...props: TProps) => OberonResponse<TResult>,
): (...props: TProps) => Promise<TResult> {
  return async (...props) => {
    const response = await action(...props)

    if (response?.message) {
      toast({
        variant: response.status === "error" ? "destructive" : "default",
        title: response.message,
      })
    }

    if (response?.status === "success") {
      if (hasMessage(response.result)) {
        toast({ title: response.result.message })
      }
      return response.result
    }

    if (response?.status === "error") {
      throw new Error(
        response.message || `${String(key)}: An unknown error has occured`,
      )
    }

    throw new Error(`${String(key)}: Invalid action response`)
  }
}

export const OberonClientProvider = ({
  children,
  serverActions,
  context,
}: PropsWithChildren<{
  serverActions: OberonServerActions
  context: OberonClientContext
}>) => {
  const actions = useMemo(() => {
    const unwrappedActions: OberonClientActions = {
      addPage: unwrapServerAction("addPage", serverActions.addPage),
      addImage: unwrapServerAction("addImage", serverActions.addImage),
      addUser: unwrapServerAction("addUser", serverActions.addUser),
      deletePage: unwrapServerAction("deletePage", serverActions.deletePage),
      deleteImage: unwrapServerAction("deleteImage", serverActions.deleteImage),
      deleteUser: unwrapServerAction("deleteUser", serverActions.deleteUser),
      can: unwrapServerAction("can", serverActions.can),
      changeRole: unwrapServerAction("changeRole", serverActions.changeRole),
      getAllImages: unwrapServerAction(
        "getAllImages",
        serverActions.getAllImages,
      ),
      getAllPages: unwrapServerAction("getAllPages", serverActions.getAllPages),
      getAllPaths: unwrapServerAction("getAllPaths", serverActions.getAllPaths),
      getAllUsers: unwrapServerAction("getAllUsers", serverActions.getAllUsers),
      getConfig: unwrapServerAction("getConfig", serverActions.getConfig),
      getPageData: unwrapServerAction("getPageData", serverActions.getPageData),
      migrateData: unwrapServerAction("migrateData", serverActions.migrateData),
      publishPageData: unwrapServerAction(
        "publishPageData",
        serverActions.publishPageData,
      ),
      signIn: unwrapServerAction("signIn", serverActions.signIn),
      signOut: unwrapServerAction("signOut", serverActions.signOut),
    }

    return unwrappedActions
  }, [serverActions])

  return (
    <ActionsContext.Provider value={actions}>
      <ClientContext.Provider value={context}>
        {children}
        <Toaster />
      </ClientContext.Provider>
    </ActionsContext.Provider>
  )
}

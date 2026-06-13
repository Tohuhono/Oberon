"use client"

import { ImageContext } from "@tohuhono/ui/image"
import { LinkContext, type LinkComponent } from "@tohuhono/ui/link"
import { Toaster, toast } from "@tohuhono/ui/toast"
import { createContext, useMemo, type PropsWithChildren } from "react"

import type {
  OberonClientContext,
  OberonImageTransform,
  OberonNavigation,
  OberonResponse,
  OberonServerActions,
  OberonClientActions,
  OberonContext,
} from "../lib/dtd"

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

    console.log(
      // oxlint-disable-next-line tohuhono/no-type-assertion-except-object-keys typescript/no-explicit-any TODO: debug response message
      `** TODO ** | reponse.message:"${response.message}" | response.result.message:"${(response.result as any)?.message}"`,
    )

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
      throw new Error(response.message || `${String(key)}: An unknown error has occured`)
    }

    throw new Error(`${String(key)}: Invalid action response`)
  }
}

export const OberonClient = createContext<OberonContext | undefined>(undefined)

export const OberonClientProvider = ({
  children,
  imageTransform,
  linkComponent,
  navigate = (href) => window.location.assign(href),
  notFound = () => {
    window.location.assign("/404")
    throw new Error("Oberon route not found")
  },
  refresh = () => window.location.reload(),
  serverActions,
  context,
}: PropsWithChildren<{
  imageTransform?: OberonImageTransform
  linkComponent?: LinkComponent
  serverActions: OberonServerActions
  context: OberonClientContext
}> &
  Partial<OberonNavigation>) => {
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
      getAllImages: unwrapServerAction("getAllImages", serverActions.getAllImages),
      getAllPages: unwrapServerAction("getAllPages", serverActions.getAllPages),
      getAllPaths: unwrapServerAction("getAllPaths", serverActions.getAllPaths),
      getAllUsers: unwrapServerAction("getAllUsers", serverActions.getAllUsers),
      getConfig: unwrapServerAction("getConfig", serverActions.getConfig),
      getPageData: unwrapServerAction("getPageData", serverActions.getPageData),
      migrateData: unwrapServerAction("migrateData", serverActions.migrateData),
      publishPageData: unwrapServerAction("publishPageData", serverActions.publishPageData),
      signIn: unwrapServerAction("signIn", serverActions.signIn),
      signOut: unwrapServerAction("signOut", serverActions.signOut),
    }

    return unwrappedActions
  }, [serverActions])

  const navigation = useMemo(() => ({ navigate, notFound, refresh }), [navigate, notFound, refresh])

  const oberonContext = useMemo(
    () => ({ context, actions, navigation }),
    [context, actions, navigation],
  )

  return (
    <OberonClient.Provider value={oberonContext}>
      <ImageContext.Provider value={imageTransform}>
        <LinkContext.Provider value={linkComponent}>
          {children}
          <Toaster />
        </LinkContext.Provider>
      </ImageContext.Provider>
    </OberonClient.Provider>
  )
}

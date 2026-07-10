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

function unwrapServerAction<TProps extends unknown[], TResult>(
  key: keyof OberonServerActions,
  action: (...props: TProps) => OberonResponse<TResult>,
): (...props: TProps) => Promise<TResult> {
  return async (...props) => {
    const response = await action(...props)

    switch (response?.status) {
      case "success": {
        if (response.message) {
          toast({ title: response.message })
        }
        return response.result
      }
      case "error": {
        toast({ variant: "destructive", title: response.message })
        throw new Error(response.message)
      }
      default:
        throw new Error(`${String(key)}: Invalid action response`)
    }
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

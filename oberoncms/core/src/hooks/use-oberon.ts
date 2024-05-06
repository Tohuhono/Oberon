import { useContext } from "react"
import { ActionsContext, ClientContext } from "@/components/provider"

export const useOberonActions = () => {
  const context = useContext(ActionsContext)

  if (!context) {
    throw new Error("No Oberon Server Actions provided")
  }

  return context
}

export const useOberonClientContext = () => {
  const context = useContext(ClientContext)

  if (!context) {
    throw new Error("No Oberon Client Context provided")
  }

  return context
}

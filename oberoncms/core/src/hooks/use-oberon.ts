import { useContext } from "react"
import { OberonContext } from "@/components/provider"

const useOberonContext = () => {
  const context = useContext(OberonContext)

  if (!context) {
    throw new Error("No Oberon Server Actions provided")
  }

  return context
}

export const useOberonActions = () => useOberonContext().actions

export const useOberonClientContext = () => useOberonContext().context

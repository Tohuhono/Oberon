import { useContext } from "react"

import { OberonClient } from "../components/provider"

const useOberon = () => {
  const oberon = useContext(OberonClient)

  if (!oberon) {
    throw new Error("No Oberon Client Context provided")
  }

  return oberon
}

export const useOberonActions = () => {
  const { actions } = useOberon()

  return actions
}

export const useOberonClient = () => {
  const { context } = useOberon()

  return context
}

export const useOberonNavigation = () => {
  const { navigation } = useOberon()

  return navigation
}

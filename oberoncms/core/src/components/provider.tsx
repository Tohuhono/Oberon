import { createContext, type PropsWithChildren } from "react"
import type { ServerActions } from "../app/schema"

export const OberonContext = createContext<ServerActions | null>(null)

export const OberonProvider = ({
  children,
  actions,
}: PropsWithChildren<{ actions: ServerActions }>) => {
  return (
    <OberonContext.Provider value={actions}>{children}</OberonContext.Provider>
  )
}

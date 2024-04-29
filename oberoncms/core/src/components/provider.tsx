import { createContext, type PropsWithChildren } from "react"
import type { OberonServerActions } from "../app/schema"

export const OberonContext = createContext<OberonServerActions | null>(null)

export const OberonProvider = ({
  children,
  actions,
}: PropsWithChildren<{ actions: OberonServerActions }>) => {
  return (
    <OberonContext.Provider value={actions}>{children}</OberonContext.Provider>
  )
}

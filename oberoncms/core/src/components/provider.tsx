import { createContext, type PropsWithChildren } from "react"
import type { OberonAdapter } from "../app/schema"

export const OberonContext = createContext<OberonAdapter | null>(null)

export const OberonProvider = ({
  children,
  adapter,
}: PropsWithChildren<{ adapter: OberonAdapter }>) => {
  return (
    <OberonContext.Provider value={adapter}>{children}</OberonContext.Provider>
  )
}

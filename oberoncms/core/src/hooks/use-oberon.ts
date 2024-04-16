import { useContext } from "react"
import { OberonContext } from "@/components/provider"

export const useOberon = () => {
  const actions = useContext(OberonContext)

  if (!actions) {
    throw new Error("No Oberon Server Actions provided")
  }

  return actions
}

import { useEffect, useState, type DependencyList } from "react"

export const useClientState = <T>(
  clientState: () => T,
  deps: DependencyList,
  serverState?: T,
) => {
  const [current, setCurrent] = useState(serverState)

  useEffect(() => setCurrent(clientState()), deps)

  return current
}

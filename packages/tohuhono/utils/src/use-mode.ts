import { useEffect } from "react"

import { useLocalStorage } from "./use-local-storage"

export type EditorMode = "light" | "dark" | "system"

export const useMode = () => {
  const [mode, setLocalMode] = useLocalStorage<EditorMode>("theme")

  const setMode = (mode: EditorMode) => setLocalMode(mode === "system" ? null : mode)

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
      return
    }

    if (mode === null && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark")
      return
    }

    document.documentElement.classList.remove("dark")
  }, [mode])

  return [mode ?? "system", setMode] as const
}

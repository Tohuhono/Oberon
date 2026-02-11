import { useRef, useSyncExternalStore } from "react"
import { Config, Data } from "@puckeditor/core"

export const useLocalData = (path: string, config: Config) => {
  const componentKey = Object.keys(config.components).join("-")
  const cachedSnapshot = useRef<{
    raw: string | null
    data: Data | null
  } | null>(null)

  const getKey = (path: string, componentKey: string) =>
    `puck-demo:${window.btoa(componentKey)}:${path}`

  const data = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback)
      return () => window.removeEventListener("storage", callback)
    },
    (): Data | null => {
      const localData = localStorage.getItem(getKey(path, componentKey))
      const cached = cachedSnapshot.current

      if (cached && cached.raw === localData) {
        return cached.data
      }

      const parsed = localData ? (JSON.parse(localData) as Data) : null
      cachedSnapshot.current = { raw: localData, data: parsed }

      return parsed
    },
    () => null,
  )

  const setLocalData = (data: Data) => {
    const key = getKey(path, componentKey)

    localStorage.setItem(key, JSON.stringify(data))

    // Manually dispatch event so THIS tab also gets the update immediately
    window.dispatchEvent(new StorageEvent("storage", { key }))
  }

  return [data, setLocalData] as const
}

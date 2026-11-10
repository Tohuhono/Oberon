import { Config, Data } from "@puckeditor/core"
import { encode } from "@tohuhono/utils"
import { useLocalStorage } from "@tohuhono/utils/use-local-storage"
import { useCallback, useRef, useSyncExternalStore } from "react"

import { FragmentDataSchema } from "../lib/dtd"

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

function localDataKey(path: string, config: Config) {
  const componentKey = Object.keys(config.components).join("-")
  return `${encode(componentKey)}:${path}`
}

export function clearLocalData(path: string, config: Config) {
  localStorage.removeItem(`oberon:${localDataKey(path, config)}`)
  window.dispatchEvent(new Event("local-storage-update"))
}

export const useLocalData = (path: string, config: Config, publishedData?: Data | null) => {
  const cachedSnapshot = useRef<{
    raw: string | null
    data: { data: Data; base: string | null } | null
  } | null>(null)

  const key = localDataKey(path, config)
  const base = JSON.stringify(publishedData ?? null)
  const isReady = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)

  const parser = useCallback((maybeData: string | null) => {
    const cached = cachedSnapshot.current

    if (cached && cached.raw === maybeData) {
      return cached.data
    }

    try {
      const rawParsed: unknown = maybeData ? JSON.parse(maybeData) : null
      let parsed: { data: Data; base: string | null } | null = null
      if (rawParsed && typeof rawParsed === "object") {
        if ("base" in rawParsed && typeof rawParsed.base === "string" && "data" in rawParsed) {
          parsed = { data: FragmentDataSchema.parse(rawParsed.data), base: rawParsed.base }
        } else {
          parsed = { data: FragmentDataSchema.parse(rawParsed), base: null }
        }
      }
      cachedSnapshot.current = { raw: maybeData, data: parsed }

      return parsed
    } catch (error) {
      console.warn("Could not read the local editor draft", error)
      return null
    }
  }, [])

  const [stored, setStored] = useLocalStorage(key, { parser })
  const setData = useCallback(
    (data: Data | null) => setStored(data ? { data, base } : null),
    [base, setStored],
  )
  const localData =
    stored && (stored.base === null || publishedData === undefined || stored.base === base)
      ? stored.data
      : null

  return [localData, setData, isReady] as const
}

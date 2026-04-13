import { useCallback, useRef } from "react"
import { Config, Data } from "@puckeditor/core"
import { useLocalStorage } from "@tohuhono/utils/use-local-storage"
import { encode } from "@tohuhono/utils"

function isData(value: unknown): value is Data {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    Array.isArray(value.content) &&
    "root" in value
  )
}

export const useLocalData = (path: string, config: Config) => {
  const componentKey = Object.keys(config.components).join("-")
  const cachedSnapshot = useRef<{
    raw: string | null
    data: Data | null
  } | null>(null)

  const key = `${encode(componentKey)}:${path}`

  const parser = useCallback((maybeData: string | null) => {
    const cached = cachedSnapshot.current

    if (cached && cached.raw === maybeData) {
      return cached.data
    }

    try {
      const rawParsed = maybeData ? JSON.parse(maybeData) : null
      const parsed = isData(rawParsed) ? rawParsed : null
      cachedSnapshot.current = { raw: maybeData, data: parsed }

      return parsed
    } catch {
      return null
    }
  }, [])

  return useLocalStorage(key, { parser })
}

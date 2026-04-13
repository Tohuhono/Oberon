import { useCallback, useMemo, useSyncExternalStore } from "react"

const defaultParser = <T>(value: string | null): T | null => {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export const useLocalStorage = <T>(
  key: string,
  {
    parser = defaultParser,
    init = () => null,
  }: {
    parser?: (value: string | null) => T | null
    init?: () => string | null
  } = {},
): [T | null, (state: T | null) => void] => {
  // 1. Memoize subscribe to avoid re-subscribing on every render
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback)
    window.addEventListener("local-storage-update", callback)
    return () => {
      window.removeEventListener("storage", callback)
      window.removeEventListener("local-storage-update", callback)
    }
  }, [])

  // 2. getSnapshot must be referentially stable if the data hasn't changed
  // We use useMemo to create a stable version of the parsed data
  const rawValue = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(`oberon:${key}`),
    init,
  )

  const data = useMemo(() => parser(rawValue), [rawValue, parser])

  const setState = useCallback(
    (newState: T | null) => {
      if (newState === null) {
        localStorage.removeItem(`oberon:${key}`)
      } else {
        localStorage.setItem(`oberon:${key}`, JSON.stringify(newState))
      }
      window.dispatchEvent(new Event("local-storage-update"))
    },
    [key],
  )

  return [data, setState]
}

import { useCallback, useMemo } from "react"
import { Config, Data } from "@measured/puck"

const encode = (path: string, componentKey: string) =>
  `puck-demo:${window.btoa(componentKey)}:${path}`

export const useLocalData = (path: string, config: Config) => {
  const componentKey = Object.keys(config.components).join("-")

  const data = useMemo(() => {
    const dataStr = localStorage.getItem(encode(path, componentKey))

    if (dataStr) {
      return JSON.parse(dataStr)
    }
  }, [path, componentKey])

  const setLocalData = useCallback(
    (data: Data) =>
      localStorage.setItem(encode(path, componentKey), JSON.stringify(data)),
    [path, componentKey],
  )

  return [data, setLocalData] as const
}

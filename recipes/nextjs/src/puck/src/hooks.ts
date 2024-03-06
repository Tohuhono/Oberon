import { useCallback, useEffect, useState } from "react"
import { Config, Data } from "@measured/puck"

export const useLocalData = (path: string, config: Config) => {
  // unique b64 key that updates each time we add / remove components
  const componentKey = Buffer.from(
    Object.keys(config.components).join("-"),
  ).toString("base64")

  const key = `puck-demo:${componentKey}:${path}`

  const [data, setData] = useState<Data>()

  useEffect(() => {
    const dataStr = localStorage.getItem(key)

    if (dataStr) {
      setData(JSON.parse(dataStr))
    }
  }, [key])

  const setLocalData = useCallback(
    (data: Data) =>
      localStorage.setItem(key, JSON.stringify(JSON.stringify(data))),
    [key],
  )

  return [data, setLocalData] as const
}

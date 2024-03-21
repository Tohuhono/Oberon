"use client"

import { Config, Data, Render } from "@measured/puck"
import { notFound } from "next/navigation"
import { useLocalData } from "@/hooks/use-local-data"

export function Preview({
  path,
  data,
  config,
}: {
  path: string
  config: Config
  data: Data | null
}) {
  const localData = useLocalData(path, config)[0] || data

  if (!localData) {
    return notFound()
  }

  return <Render data={localData} config={config} />
}

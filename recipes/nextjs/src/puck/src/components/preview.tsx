"use client"

import { Config, Data, Render } from "@measured/puck"
import { notFound } from "next/navigation"
import { useLocalData } from "@/puck/src/hooks"

export function Preview({
  path,
  data,
  config,
}: {
  path: string
  config: Config
  data?: Data
}) {
  const localData = useLocalData(path, config)[0] || data

  if (!localData) {
    return notFound()
  }

  return <Render data={localData} config={config} />
}

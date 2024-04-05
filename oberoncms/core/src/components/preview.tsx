import type { Config, Data } from "@measured/puck"
import { notFound } from "next/navigation"
import { DynamicTailwind } from "@oberon/ui/theme"
import dynamic from "next/dynamic"
import { useLocalData } from "@/hooks/use-local-data"

const Render = dynamic(import("@measured/puck").then((m) => m.Render))

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

  if (!localData || !data) {
    return notFound()
  }

  return (
    <>
      <Render data={localData} config={config} />
      <DynamicTailwind />
    </>
  )
}

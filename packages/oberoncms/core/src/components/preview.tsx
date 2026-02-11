import { Render, type Config, type Data } from "@puckeditor/core"
import { useLocalData } from "../hooks/use-local-data"

export function Preview({
  path,
  data,
  config,
}: {
  path: string
  config: Config
  data: Data | null
}) {
  const localData = useLocalData(path, config)[0]

  if (!localData || !data) {
    return <></>
  }

  return <Render data={localData} config={config} />
}

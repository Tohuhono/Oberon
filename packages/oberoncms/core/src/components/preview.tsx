import { Render, type Config, type Data } from "@puckeditor/core"

import { useLocalData } from "../hooks/use-local-data"

export function Preview({
  path,
  data,
  config,
  draftConfig = config,
  prepareData,
}: {
  path: string
  config: Config
  data: Data | null
  draftConfig?: Config
  prepareData?: (data: Data) => Data
}) {
  const [localData, , isReady] = useLocalData(path, draftConfig, data)
  const content = localData ?? data

  if (!isReady || !content) {
    return <div role="status">Loading preview...</div>
  }

  return <Render data={prepareData ? prepareData(content) : content} config={config} />
}

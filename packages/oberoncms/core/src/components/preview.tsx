import { Render, type Config, type Data } from "@puckeditor/core"

import { usePageDraft } from "../hooks/use-component-draft"

export function Preview({
  path,
  data,
  config,
}: {
  path: string
  config: Config
  data: Data | null
}) {
  const { draft } = usePageDraft(path, config)
  const previewData = draft?.data ?? data

  if (!previewData) {
    return null
  }

  return <Render data={previewData} config={config} />
}

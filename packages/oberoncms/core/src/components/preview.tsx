import { Render, type Config, type Data } from "@puckeditor/core"

import { usePageDraft } from "../hooks/use-fragment-draft"
import type { SharedComponentData } from "../lib/dtd"
import { withSharedEditorComponents } from "./shared-component-render"

export function Preview({
  path,
  data,
  config,
  sharedComponents,
}: {
  path: string
  config: Config
  data: Data | null
  sharedComponents: Record<string, SharedComponentData>
}) {
  const session = withSharedEditorComponents(config, sharedComponents, Render)
  const { draft } = usePageDraft(path, config)
  const preview = draft?.data ?? data

  return preview ? (
    <Render
      data={session.toEditorData(preview)}
      config={session.config}
      metadata={{ sharedComponents }}
    />
  ) : null
}

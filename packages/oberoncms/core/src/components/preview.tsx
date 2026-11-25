import type { Config, Data } from "@puckeditor/core"
import { useMemo } from "react"

import { usePageDraft } from "../hooks/use-fragment-draft"
import type { SharedComponentData } from "../lib/dtd"
import { ResolvedPreview } from "./editor/resolved-preview"
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
  const session = useMemo(
    () =>
      withSharedEditorComponents(config, sharedComponents, (props) => (
        <ResolvedPreview {...props} />
      )),
    [config, sharedComponents],
  )
  const { draft } = usePageDraft(path, config)
  const preview = draft?.data ?? data

  return preview ? (
    <ResolvedPreview
      data={session.toEditorData(preview)}
      config={session.config}
      metadata={{ sharedComponents }}
    />
  ) : null
}

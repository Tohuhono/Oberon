"use client"

import type { Config, Data } from "@puckeditor/core"
import { useMemo } from "react"

import {
  useBrowserDraftsReady,
  useDraftPublication,
  usePageDraft,
} from "../hooks/use-component-draft"
import { useOberonActions } from "../hooks/use-oberon"
import { INITIAL_DATA, type SharedComponentData } from "../lib/dtd"
import { DraftConflict } from "./editor/draft-conflict"
import { Header } from "./editor/header"
import { ResolvedPreview } from "./editor/resolved-preview"
import { EditorWorkspace } from "./editor/workspace"
import { withSharedEditorComponents } from "./shared-component-render"
import { SharedInstancePanel } from "./shared-instance-panel"

export function Editor(props: {
  path: string
  data: Data | null
  updatedAt: Date | null
  config: Config
  sharedComponents: Record<string, SharedComponentData>
}) {
  return useBrowserDraftsReady() ? <PageEditor key={props.path} {...props} /> : null
}

function PageEditor({
  path,
  data,
  updatedAt,
  config,
  sharedComponents,
}: Parameters<typeof Editor>[0]) {
  const { publishComponentData } = useOberonActions()
  const editorSession = useMemo(
    () =>
      withSharedEditorComponents(config, sharedComponents, (props) => (
        <ResolvedPreview {...props} />
      )),
    [config, sharedComponents],
  )
  const draft = usePageDraft(path, config)
  const publication = useDraftPublication({ ...draft, updatedAt })
  const editorData = editorSession.toEditorData(draft.draft?.data ?? data ?? INITIAL_DATA)

  const onPublish = async (pageData: Data) => {
    if (publication.isStale) return
    const storedData = editorSession.toStoredData(pageData)
    await publication.publish((expectedUpdatedAt) =>
      publishComponentData({ key: path, type: "page", data: storedData, expectedUpdatedAt }),
    )
  }

  return (
    <EditorWorkspace
      config={editorSession.config}
      data={editorData}
      sharedComponents={sharedComponents}
      onChange={(nextData) => publication.saveDraft(editorSession.toStoredData(nextData))}
      onPublish={onPublish}
      header={
        <>
          <Header path={path} onPublish={onPublish} publishDisabled={publication.isStale} />
          {publication.isStale && <DraftConflict {...publication} />}
        </>
      }
      fieldsFooter={<SharedInstancePanel path={path} library={sharedComponents} />}
    />
  )
}

"use client"

import { type Config, type Data, Render as PuckRender, useGetPuck } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
import { Input } from "@tohuhono/ui/input"
import { useMemo, useState } from "react"

import {
  useBrowserDraftsReady,
  useDraftPublication,
  useSharedDraft,
} from "../hooks/use-fragment-draft"
import { useOberonActions, useOberonNavigation } from "../hooks/use-oberon"
import {
  readSourceDraft,
  useSharedSourceSettings,
  withSourceSettings,
} from "../hooks/use-shared-source-settings"
import type { OberonSharedFragment, SharedComponentData } from "../lib/dtd"
import { DraftConflict } from "./editor/draft-conflict"
import { EditorWorkspace } from "./editor/workspace"
import { Menu } from "./menu"
import { withSharedEditorComponents } from "./shared-component-render"
import { SharedExposurePanel } from "./shared-exposure-panel"

function SharedSourceHeader({
  returnTo,
  onPublish,
  isPublishing,
  isConflicted,
}: {
  returnTo: string | null
  onPublish: (data: Data) => Promise<void>
  isPublishing: boolean
  isConflicted: boolean
}) {
  const { navigate } = useOberonNavigation()
  const getPuck = useGetPuck()

  return (
    <Menu title="Shared component source">
      <Button variant="outline" size="sm" onClick={() => navigate(returnTo ?? "/cms/library")}>
        {returnTo ? "Back to Page" : "Back to library"}
      </Button>
      <Button
        size="sm"
        onClick={() => onPublish(getPuck().appState.data)}
        disabled={isPublishing || isConflicted}
      >
        Publish source
      </Button>
    </Menu>
  )
}

export function SharedSourceEditor({
  source,
  library,
  clientConfig,
  returnTo,
  canWrite,
}: {
  source: OberonSharedFragment
  library: Record<string, SharedComponentData>
  clientConfig: Config
  returnTo: string | null
  canWrite: boolean
}) {
  const editorSession = useMemo(
    () => withSharedEditorComponents(clientConfig, library, PuckRender),
    [clientConfig, library],
  )
  if (!useBrowserDraftsReady()) return null
  return canWrite ? (
    <EditableSharedSource
      key={source.key}
      source={source}
      library={library}
      returnTo={returnTo}
      session={editorSession}
    />
  ) : (
    <ReadOnlySharedSource
      source={source}
      library={library}
      returnTo={returnTo}
      session={editorSession}
    />
  )
}

function ReadOnlySharedSource({
  source,
  library,
  returnTo,
  session,
}: {
  source: OberonSharedFragment
  library: Record<string, SharedComponentData>
  returnTo: string | null
  session: ReturnType<typeof withSharedEditorComponents>
}) {
  const { navigate } = useOberonNavigation()
  return (
    <div className="min-h-dvh bg-background">
      <Menu title="Shared component source">
        <Button variant="outline" size="sm" onClick={() => navigate(returnTo ?? "/cms/library")}>
          {returnTo ? "Back to Page" : "Back to library"}
        </Button>
      </Menu>
      <p className="m-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        Read-only source. Ask an author with Pages write permission to make changes.
      </p>
      <main className="mx-auto max-w-5xl p-4">
        <PuckRender
          data={session.toEditorData(source.data.tree)}
          config={session.config}
          metadata={{ sharedComponents: library }}
        />
      </main>
    </div>
  )
}

function EditableSharedSource({
  source,
  library,
  returnTo,
  session,
}: Parameters<typeof ReadOnlySharedSource>[0]) {
  const { publishFragmentData } = useOberonActions()
  const { refresh } = useOberonNavigation()
  const draft = useSharedDraft(source.key)
  const publication = useDraftPublication({ ...draft, updatedAt: source.updatedAt })
  const initialData = draft.draft?.data ?? source.data
  const { tree, ...settings } = initialData
  const editorData = withSourceSettings(session.toEditorData(tree), settings)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const toSourceData = (nextData: Data) => readSourceDraft(session.toStoredData(nextData))

  const onPublish = async (nextData: Data) => {
    if (publication.isStale) return
    setIsPublishing(true)
    setPublishError(null)
    try {
      const data = toSourceData(nextData)
      await publication.publish((expectedUpdatedAt) =>
        publishFragmentData({ key: source.key, type: "shared", data, expectedUpdatedAt }),
      )
      refresh()
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Could not publish Shared component.",
      )
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <EditorWorkspace
      config={session.config}
      data={editorData}
      sharedComponents={library}
      onChange={(nextData) => publication.saveDraft(toSourceData(nextData))}
      onPublish={onPublish}
      header={
        <>
          <SharedSourceHeader
            returnTo={returnTo}
            onPublish={onPublish}
            isPublishing={isPublishing}
            isConflicted={publication.isStale}
          />
          <div className="border-b bg-card px-4 py-2">
            <SourceName />
            {publication.isStale && <DraftConflict {...publication} />}
            {publishError && (
              <p role="alert" className="p-2 text-sm text-destructive">
                {publishError}
              </p>
            )}
          </div>
        </>
      }
      fieldsFooter={<SharedExposurePanel config={session.config} />}
    />
  )
}

function SourceName() {
  const { settings, updateSettings } = useSharedSourceSettings()
  return (
    <Input
      aria-label="Shared component name"
      className="max-w-sm"
      value={settings.name}
      onChange={(event) => updateSettings({ name: event.currentTarget.value })}
    />
  )
}

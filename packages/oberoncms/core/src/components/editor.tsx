"use client"

import "@puckeditor/core/puck.css"
import { Config, Data, Puck, Render as PuckRender, type Metadata } from "@puckeditor/core"
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react"

import { useLocalData } from "../hooks/use-local-data"
import { useOberonActions, useOberonClient } from "../hooks/use-oberon"
import { INITIAL_DATA, type SharedComponentData } from "../lib/dtd"
import { Header } from "./editor/header"
import { Preview, PreviewHeading, useViewPort } from "./editor/preview"
import { PreviewIframe, type PreviewMode } from "./editor/preview-iframe"
import {
  Drawer,
  DrawerItem,
  Sidebar,
  SidebarHeading,
  SidebarTabs,
  useSidebarTab,
} from "./editor/sidebar"
import { withSharedComponent, withSharedEditorComponents } from "./shared-component-render"
import { SharedInstancePanel } from "./shared-components"

const PreviewModeContext = createContext<PreviewMode>("follow")

function EditorIframe({
  children,
  document: iframeDocument,
}: PropsWithChildren<{ document?: Document }>) {
  const previewMode = useContext(PreviewModeContext)

  return (
    <PreviewIframe iframeDocument={iframeDocument} previewMode={previewMode}>
      {children}
    </PreviewIframe>
  )
}

const editorOverrides = {
  drawer: Drawer,
  drawerItem: DrawerItem,
  iframe: EditorIframe,
}

function renderPuckTree({
  config,
  data,
  metadata,
}: {
  config: Config
  data: Data
  metadata: Metadata
}) {
  return <PuckRender data={data} config={config} metadata={metadata} />
}

export function Editor({
  path,
  data,
  config,
  sharedComponents,
}: {
  path: string
  data: Data | null
  config: Config
  sharedComponents: Record<string, SharedComponentData>
}) {
  const { publishFragmentData } = useOberonActions()
  const context = useOberonClient()
  const sharedConfig = useMemo(
    () => withSharedComponent(config, renderPuckTree, sharedComponents),
    [config, sharedComponents],
  )
  const editorSession = useMemo(
    () => withSharedEditorComponents(config, sharedComponents, renderPuckTree),
    [config, sharedComponents],
  )
  const [localData, setLocalData] = useLocalData(path, sharedConfig)
  const editorData = editorSession.toEditorData(data || localData || INITIAL_DATA)

  const { activeTab, setActiveTab } = useSidebarTab()
  const { currentViewport, setCurrentViewport } = useViewPort()
  const [previewMode, setPreviewMode] = useState<PreviewMode>("follow")
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(
    context.action === "edit" ? context.updatedAt : null,
  )

  const onPublish = async (pageData: Data) => {
    const result = await publishFragmentData({
      key: path,
      type: "page",
      data: editorSession.toStoredData(pageData),
      ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}),
    })
    setExpectedUpdatedAt(result.updatedAt)
  }

  const onChange = (pageData: Data) => {
    setLocalData(editorSession.toStoredData(pageData))
  }

  return (
    <PreviewModeContext value={previewMode}>
      <Puck
        config={editorSession.config}
        data={editorData}
        metadata={{ sharedComponents }}
        onChange={onChange}
        onAction={(action) => {
          if (action.type === "insert") {
            setActiveTab("fields")
          }
        }}
        onPublish={onPublish}
        overrides={editorOverrides}
      >
        <div
          className="
          grid h-dvh grid-cols-[minmax(0,1fr)_auto_300px]
          grid-rows-[auto_auto_1fr] overflow-hidden bg-card
        "
        >
          <span className="col-span-3">
            <Header path={path} onPublish={onPublish} />
          </span>
          <PreviewHeading
            className="flex flex-row items-center justify-center gap-6 pt-0.5"
            currentViewport={currentViewport}
            setCurrentViewport={setCurrentViewport}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
          />
          <div className="" />
          <SidebarHeading
            className="
            rounded-tl-lg bg-sidebar-primary text-sidebar-primary-foreground
          "
            activeTab={activeTab}
          />

          <Preview className="p-1" currentViewport={currentViewport} />

          <SidebarTabs
            className="
            flex flex-col pt-2
            [&>button]:aria-selected:bg-sidebar-primary
          "
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Sidebar
            className="
            border-t-2 border-l-2 border-sidebar-primary bg-sidebar-background
            text-sidebar-foreground
          "
            activeTab={activeTab}
            fieldsFooter={<SharedInstancePanel path={path} library={sharedComponents} />}
          />
        </div>
      </Puck>
    </PreviewModeContext>
  )
}

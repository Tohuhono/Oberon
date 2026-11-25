"use client"

import "@puckeditor/core/puck.css"
import { Puck, Render as PuckRender, type Config, type Data, type Metadata } from "@puckeditor/core"
import { createContext, useContext, useState, type PropsWithChildren, type ReactNode } from "react"

import type { SharedComponentData } from "../../lib/dtd"
import { Preview, PreviewHeading, useViewPort } from "./preview"
import { PreviewIframe, type PreviewMode } from "./preview-iframe"
import { Drawer, DrawerItem, Sidebar, SidebarHeading, SidebarTabs, useSidebarTab } from "./sidebar"

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

export function renderPuckTree({
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

export function EditorWorkspace({
  config,
  data,
  sharedComponents,
  onChange,
  onPublish,
  header,
  fieldsFooter,
}: {
  config: Config
  data: Data
  sharedComponents: Record<string, SharedComponentData>
  onChange: (data: Data) => void
  onPublish: (data: Data) => Promise<void>
  header: ReactNode
  fieldsFooter: ReactNode
}) {
  const { activeTab, setActiveTab } = useSidebarTab()
  const { currentViewport, setCurrentViewport } = useViewPort()
  const [previewMode, setPreviewMode] = useState<PreviewMode>("follow")
  return (
    <PreviewModeContext value={previewMode}>
      <Puck
        config={config}
        data={data}
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
          <div className="col-span-3">{header}</div>
          <PreviewHeading
            className="flex flex-row items-center justify-center gap-6 pt-0.5"
            currentViewport={currentViewport}
            setCurrentViewport={setCurrentViewport}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
          />
          <div />
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
            fieldsFooter={fieldsFooter}
          />
        </div>
      </Puck>
    </PreviewModeContext>
  )
}

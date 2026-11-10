"use client"

import "@puckeditor/core/puck.css"
import { Config, Data, Puck } from "@puckeditor/core"
import { createContext, useContext, useState, type PropsWithChildren, type ReactNode } from "react"

import { useLocalData } from "../hooks/use-local-data"
import { useOberonActions } from "../hooks/use-oberon"
import { INITIAL_DATA } from "../lib/dtd"
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
const editorDnd = { enableDragHandle: true }

type EditorProps = {
  path: string
  data: Data | null
  config: Config
  draftConfig?: Config
  draftKey?: string
  prepareData?: (data: Data) => Data
  readData?: (data: Data) => Data
  onPublish?: (data: Data) => Promise<void>
  header?: ReactNode
  fieldsFooter?: ReactNode
  libraryLabel?: string
}

export function Editor(props: EditorProps) {
  const [localData, setLocalData, isReady] = useLocalData(
    props.draftKey ?? props.path,
    props.draftConfig ?? props.config,
    props.data,
  )

  if (!isReady) {
    return (
      <div role="status" className="grid h-dvh place-items-center text-muted-foreground">
        Loading editor...
      </div>
    )
  }

  return (
    <EditorSession
      {...props}
      initialData={localData ?? props.data ?? INITIAL_DATA}
      onChange={(changed) => setLocalData(props.readData ? props.readData(changed) : changed)}
    />
  )
}

function EditorSession({
  path,
  config,
  prepareData,
  readData,
  onPublish: publish,
  header,
  fieldsFooter,
  libraryLabel,
  initialData,
  onChange,
}: EditorProps & { initialData: Data; onChange: (data: Data) => void }) {
  const { publishFragmentData } = useOberonActions()
  const [editorData] = useState(() => (prepareData ? prepareData(initialData) : initialData))

  const { activeTab, setActiveTab } = useSidebarTab()
  const { currentViewport, setCurrentViewport } = useViewPort()
  const [previewMode, setPreviewMode] = useState<PreviewMode>("follow")

  const onPublish = async (pageData: Data) => {
    const canonical = readData ? readData(pageData) : pageData
    if (publish) {
      await publish(canonical)
    } else {
      await publishFragmentData({ key: path, type: "page", data: canonical })
    }
  }

  return (
    <PreviewModeContext value={previewMode}>
      <Puck
        config={config}
        data={editorData}
        onChange={onChange}
        onAction={(action) => {
          if (action.type === "insert") {
            setActiveTab("fields")
          }
        }}
        onPublish={onPublish}
        overrides={editorOverrides}
        dnd={editorDnd}
      >
        <div
          className="
          grid h-dvh grid-cols-[minmax(0,1fr)_auto_300px]
          grid-rows-[auto_auto_1fr] overflow-hidden bg-card
        "
        >
          <span className="col-span-3">
            {header ?? <Header path={path} onPublish={onPublish} libraryLabel={libraryLabel} />}
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
            fieldsFooter={fieldsFooter}
          />
        </div>
      </Puck>
    </PreviewModeContext>
  )
}

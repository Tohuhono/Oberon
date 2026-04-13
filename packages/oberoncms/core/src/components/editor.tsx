"use client"

import "@puckeditor/core/puck.css"

import { Config, Data, Puck } from "@puckeditor/core"
import { useMemo, useState, type PropsWithChildren } from "react"

import { useLocalData } from "../hooks/use-local-data"
import { INITIAL_DATA } from "../lib/dtd"
import { useOberonActions } from "../hooks/use-oberon"
import { Preview, PreviewHeading, useViewPort } from "./editor/preview"
import { Header } from "./editor/header"
import {
  Drawer,
  DrawerItem,
  Sidebar,
  SidebarHeading,
  SidebarTabs,
  useSidebarTab,
} from "./editor/sidebar"
import { PreviewIframe, type PreviewMode } from "./editor/preview-iframe"

export function Editor({
  path,
  data,
  config,
}: {
  path: string
  data: Data | null
  config: Config
}) {
  const { publishPageData } = useOberonActions()
  const [localData, setLocalData] = useLocalData(path, config)

  const { activeTab, setActiveTab } = useSidebarTab()
  const { currentViewport, setCurrentViewport } = useViewPort()
  const [previewMode, setPreviewMode] = useState<PreviewMode>("follow")

  const editorOverrides = useMemo(
    () => ({
      drawer: Drawer,
      drawerItem: DrawerItem,
      iframe: ({
        children,
        document: iframeDocument,
      }: PropsWithChildren<{ document?: Document }>) => (
        <PreviewIframe
          iframeDocument={iframeDocument}
          previewMode={previewMode}
        >
          {children}
        </PreviewIframe>
      ),
    }),
    [previewMode],
  )

  const onPublish = async (data: Data) => {
    await publishPageData({
      key: path,
      data,
    })
  }

  return (
    <Puck
      config={config}
      data={data || localData || INITIAL_DATA}
      onChange={(data: Data) => {
        setLocalData(data)
      }}
      onAction={(action) => {
        if (action.type === "insert") {
          console.log("A componlement was inserted:", action.componentType)
          setActiveTab("fields")
        }
      }}
      onPublish={onPublish}
      overrides={editorOverrides}
    >
      <div className="bg-card grid h-dvh grid-cols-[minmax(0,1fr)_auto_300px] grid-rows-[auto_auto_1fr] overflow-hidden">
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
          className="bg-sidebar-primary text-sidebar-primary-foreground rounded-tl-lg"
          activeTab={activeTab}
        />

        <Preview className="p-1" currentViewport={currentViewport} />

        <SidebarTabs
          className="[&>button]:aria-selected:bg-sidebar-primary flex flex-col pt-2"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <Sidebar
          className="border-sidebar-primary bg-sidebar-background text-sidebar-foreground border-t-2 border-l-2"
          activeTab={activeTab}
        />
      </div>
    </Puck>
  )
}

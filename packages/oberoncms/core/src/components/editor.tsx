"use client"

import "@puckeditor/core/puck.css"

import { Config, Data, Puck } from "@puckeditor/core"
import { type ReactNode } from "react"
import { useLocalData } from "../hooks/use-local-data"
import { INITIAL_DATA } from "../lib/dtd"
import { useOberonActions } from "../hooks/use-oberon"
import { Preview } from "./editor/preview"
import { Header } from "./editor/header"
import { Sidebar } from "./editor/sidebar"

const editorOverrides = {
  drawer: ({ children }: { children: ReactNode }) => (
    <div className="bg-background/40 border-border h-full space-y-2 rounded-lg border p-2">
      {children}
    </div>
  ),
  drawerItem: ({ name }: { name: string }) => (
    <div className="bg-card text-card-foreground border-border hover:bg-accent/40 hover:text-accent-foreground rounded-xl border shadow transition-colors">
      {name}
    </div>
  ),
}

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
      onPublish={onPublish}
      overrides={editorOverrides}
    >
      <div className="grid h-dvh grid-cols-[minmax(0,1fr)_300px] grid-rows-[auto_1fr] overflow-hidden">
        <Header path={path} onPublish={onPublish} className="col-span-2" />
        <Preview />
        <Sidebar />
      </div>
    </Puck>
  )
}

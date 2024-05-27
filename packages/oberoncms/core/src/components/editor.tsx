"use client"

import "@measured/puck/dist/index.css"

import { Config, Data, Puck, usePuck } from "@measured/puck"
import { Button } from "@tohuhono/ui/button"
import { useState } from "react"
import { useLocalData } from "../hooks/use-local-data"
import { INITIAL_DATA } from "../app/schema"
import { useOberonActions } from "../hooks/use-oberon"
import { Menu } from "./menu"

const Header = ({
  path,
  onPublish,
}: {
  path: string
  onPublish: (data: Data) => Promise<void>
}) => {
  const { appState, dispatch } = usePuck()
  const [ispublishing, setIspublishing] = useState(false)

  const { leftSideBarVisible } = appState.ui

  return (
    <div style={{ gridArea: "header" }}>
      <Menu title={appState.data.root.title} path={path}>
        <Button
          onClick={() =>
            dispatch({
              type: "setUi",
              ui: {
                leftSideBarVisible: !leftSideBarVisible,
              },
            })
          }
          variant="outline"
          size="sm"
        >
          {leftSideBarVisible ? "<" : ">"}
        </Button>
        {/*
     // TODO puck history
    <Button
      variant="outline"
      size="sm"
      disabled={!canRewind}
      onClick={() => rewind()}
    >
      {"Undo"}
    </Button>
    <Button
      size="sm"
      variant="outline"
      disabled={!canForward}
      onClick={() => forward()}
    >
      {"Redo"}
    </Button>
    */}
        <Button
          onClick={() => window.open(`/cms/preview${path}`, "_blank")?.focus()}
          variant="outline"
          size="sm"
        >
          Preview
        </Button>
        <Button
          onClick={() => window.open(path, "_blank")?.focus()}
          variant="outline"
          size="sm"
        >
          View
        </Button>
        <Button
          disabled={ispublishing}
          onClick={async () => {
            setIspublishing(true)
            await onPublish(appState.data)
            setIspublishing(false)
          }}
          size="sm"
        >
          Publish
        </Button>
      </Menu>
    </div>
  )
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

  /* TODO types need fixing */
  return (
    <Puck
      config={config}
      data={data || localData || INITIAL_DATA}
      onChange={(data: Data) => {
        setLocalData(data)
      }}
      onPublish={() => {}}
      plugins={[]}
      headerPath={path}
      overrides={{
        header: () => <Header path={path} onPublish={onPublish} />,
      }}
    />
  )
}

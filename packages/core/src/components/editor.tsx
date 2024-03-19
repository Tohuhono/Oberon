"use client"

import "@measured/puck/dist/index.css"

import { Config, Data, Puck, usePuck } from "@measured/puck"
import { Button } from "@oberon/ui/button"
import { PuckMenu } from "./puck-menu"
import { useLocalData } from "@/app/hooks"
import type { Actions } from "@/schema"

const Header = ({
  path,
  onPublish,
}: {
  path: string
  onPublish: (data: Data) => void
}) => {
  const { appState, dispatch } = usePuck()

  const { leftSideBarVisible } = appState.ui

  return (
    <div style={{ gridArea: "header" }}>
      <PuckMenu title={appState.data.root.title} path={path}>
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
        <Button onClick={() => onPublish(appState.data)} size="sm">
          Publish
        </Button>
      </PuckMenu>
    </div>
  )
}

export function Editor({
  path,
  data,
  config,
  publishPageData,
}: {
  path: string
  data: Data | null
  config: Config
  publishPageData: Actions["publishPageData"]
}) {
  const [localData, setLocalData] = useLocalData(path, config)

  const onPublish = async (data: Data) => {
    if (!localData) {
      return
    }

    console.log("start pub", data)
    const published = await publishPageData({
      key: path,
      data,
    })
    console.log("end pub", published)
    // TODO notify? dissable button?
  }

  /* TODO types need fixing */
  return (
    <Puck
      config={config}
      data={data || localData || { content: [], root: { title: "" } }}
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

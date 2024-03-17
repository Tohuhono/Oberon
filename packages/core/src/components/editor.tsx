"use client"

import "@measured/puck/dist/index.css"

import { Config, Data, Puck } from "@measured/puck"
import { Button } from "@oberon/ui"
import { PuckMenu } from "./puck-menu"
import { useLocalData } from "@/app/hooks"
import type { Actions } from "@/schema"

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
      renderHeader={({
        state,
        dispatch,
        // TODO puck history
        // history: { canForward, canRewind, forward, rewind },
      }) => {
        const { leftSideBarVisible } = state.ui

        return (
          <PuckMenu title={state.data.root.title} path={path}>
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
              onClick={() =>
                window.open(`/cms/preview${path}`, "_blank")?.focus()
              }
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
              onClick={async () => {
                if (!localData) {
                  return
                }

                console.log("start pub", state.data)
                const data = await publishPageData({
                  key: path,
                  data: state.data,
                })
                console.log("end pub", data)
                // TODO notify? dissable button?
              }}
              size="sm"
            >
              Publish
            </Button>
          </PuckMenu>
        )
      }}
    />
  )
}

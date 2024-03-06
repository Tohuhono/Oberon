"use client"

import "@measured/puck/dist/index.css"

import { Config, Data, Puck } from "@measured/puck"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { PuckMenu } from "@/puck/src/components/puck-menu"
import { useLocalData } from "@/puck/src/hooks"
import { publishPageData } from "@/puck/src/actions"

export function Editor({
  path,
  data,
  config,
}: {
  path: string
  data?: Data
  config: Config
}) {
  const [localData, setLocalData] = useLocalData(path, config)
  const [transitioning, startTransition] = useTransition()

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
        history: { canForward, canRewind, forward, rewind },
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
              disabled={transitioning}
              onClick={() => {
                localData &&
                  startTransition(async () => {
                    console.log("pub", state.data)
                    await publishPageData({ key: path, data: state.data })
                  })
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

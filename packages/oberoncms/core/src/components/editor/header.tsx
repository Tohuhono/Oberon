"use client"

import { useGetPuck, createUsePuck, type Data } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
import { useState } from "react"

import { Menu } from "../menu"
import { HistoryControls } from "./history"

const usePuck = createUsePuck()

export const Header = ({
  path,
  onPublish,
  libraryLabel,
}: {
  path: string
  onPublish: (data: Data) => Promise<void>
  libraryLabel?: string
}) => {
  const title = usePuck((s) => s.appState.data.root.title)
  const getPuck = useGetPuck()
  const [isPublishing, setIsPublishing] = useState(false)

  return (
    <Menu title={title} path={path} libraryLabel={libraryLabel}>
      <HistoryControls />
      <Button
        onClick={() => window.open(`/cms/preview${path}`, "_blank")?.focus()}
        variant="outline"
        size="sm"
      >
        Preview
      </Button>
      <Button onClick={() => window.open(path, "_blank")?.focus()} variant="outline" size="sm">
        View
      </Button>
      <Button
        disabled={isPublishing}
        onClick={async () => {
          setIsPublishing(true)
          try {
            await onPublish(getPuck().appState.data)
          } finally {
            setIsPublishing(false)
          }
        }}
        size="sm"
      >
        Publish
      </Button>
    </Menu>
  )
}

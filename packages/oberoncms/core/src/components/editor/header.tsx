"use client"

import { Button } from "@tohuhono/ui/button"
import { useState } from "react"
import { useGetPuck, createUsePuck, type Data } from "@puckeditor/core"

import { Menu } from "../menu"

const usePuck = createUsePuck()

export const Header = ({
  path,
  onPublish,
}: {
  path: string
  onPublish: (data: Data) => Promise<void>
}) => {
  const title = usePuck((s) => s.appState.data.root.title)
  const getPuck = useGetPuck()
  const [isPublishing, setIsPublishing] = useState(false)

  return (
    <Menu title={title} path={path}>
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

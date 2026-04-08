"use client"

import { Data, createUsePuck, useGetPuck } from "@puckeditor/core"
import { Button } from "@tohuhono/ui/button"
import { useState } from "react"
import { Menu } from "../menu"

const usePuck = createUsePuck()

export const Header = ({
  path,
  className,
  onPublish,
}: {
  path: string
  className: string
  onPublish: (data: Data) => Promise<void>
}) => {
  const title = usePuck((s) => s.appState.data.root.title)
  const getPuck = useGetPuck()
  const [isPublishing, setIsPublishing] = useState(false)

  return (
    <div className={className}>
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
    </div>
  )
}

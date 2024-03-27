"use client"

import type { RichTextState } from "@tohuhono/puck-rich-text"

import dynamic from "next/dynamic"
import { use, useEffect, useState } from "react"
import ClickAwayListener from "react-click-away-listener"
const RichText = dynamic(
  () => import("@tohuhono/puck-rich-text/editor").then((m) => m.RichText),
  { ssr: false },
)

export const RichTextDemo = () => {
  const [state, setState] = useState<RichTextState>({
    root: {
      children: [
        {
          // @ts-expect-error lexical type error
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "Click here to edit",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  })
  const [enabled, setEnabled] = useState(false)

  console.log("lkkk")

  const [toolbarTarget, setToolbarTarget] = useState<HTMLElement | null>(null)
  // const toolbarTarget = useRef(null)
  useEffect(() => {
    if (enabled && typeof document !== "undefined") {
      setToolbarTarget(document.getElementById("rich-text-toolbar"))
    }
  }, [enabled])

  return (
    <>
      <div className="flex justify-center pt-10 bg-slate-800">
        <div
          suppressHydrationWarning
          className="prose dark:prose-invert bg-slate-400 min-w-96 relative"
          onClick={(event) => {
            event.stopPropagation()
            setEnabled(true)
          }}
        >
          {enabled && (
            <div
              className={"bg-slate-200 -top-8 absolute p-2"}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <div id="rich-text-toolbar" />
            </div>
          )}

          <RichText
            id="rich"
            toolbarTarget={toolbarTarget}
            state={state as RichTextState}
            onChange={({ state }) => {
              console.log("sc ->", JSON.stringify(state))
              setState(state)
            }}
            enabled={enabled}
          />
        </div>
      </div>
    </>
  )
}

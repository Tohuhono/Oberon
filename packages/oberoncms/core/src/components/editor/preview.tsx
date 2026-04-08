"use client"

import "@puckeditor/core/puck.css"

import { Puck } from "@puckeditor/core"

import { useState } from "react"
import { isValidKey } from "../../lib/utils"
import { useFitZoom } from "../../hooks/use-fit-zoom"

const viewPorts = {
  small: {
    width: 360,
    height: "auto",
    icon: "Smartphone",
    label: "Small",
  },
  medium: {
    width: 768,
    height: "auto",
    icon: "Tablet",
    label: "Medium",
  },
  large: {
    width: 1280,
    height: "auto",
    icon: "Monitor",
    label: "Large",
  },
  full: {
    width: "100%",
    height: "auto",
    icon: "FullWidth",
    label: "Full-width",
  },
} as const
type ViewPort = keyof typeof viewPorts

export const Preview = () => {
  const [currentViewport, setCurrentViewport] = useState<ViewPort>("full")
  const currentViewportWidth = viewPorts[currentViewport].width

  const { ref, scale, scaledHeight } = useFitZoom(currentViewportWidth)

  return (
    <div className="bg-muted">
      <div className="p-3">
        <div className="flex flex-col items-center">
          <label className="text-muted-foreground flex items-center text-xs">
            <span>Viewport size</span>
            <select
              aria-label="Viewport size"
              value={currentViewport}
              onChange={(event) => {
                const value = event.target.value
                if (isValidKey(value, viewPorts)) {
                  setCurrentViewport(value)
                }
              }}
            >
              {Object.entries(viewPorts).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div ref={ref} className="h-full p-2">
        <div
          data-testid="editor-viewport-frame"
          className="mx-auto origin-top-left"
          style={{
            width: currentViewportWidth,
            height: scaledHeight,
            transform: `scale(${scale})`,
          }}
        >
          <Puck.Preview id="preview-frame" />
        </div>
      </div>
    </div>
  )
}

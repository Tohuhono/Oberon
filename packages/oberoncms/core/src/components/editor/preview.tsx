"use client"

import "@puckeditor/core/puck.css"

import { Puck } from "@puckeditor/core"

import { useState } from "react"

import { Button } from "@tohuhono/ui/button"
import { cn, isValidKey } from "@tohuhono/utils"
import {
  MobileIcon,
  LaptopIcon,
  DesktopIcon,
  WidthIcon,
} from "@radix-ui/react-icons"
import { useFitZoom } from "../../hooks/use-fit-zoom"

const viewPorts = {
  small: {
    width: 360,
    height: "auto",
    icon: MobileIcon,
    label: "Small",
  },
  medium: {
    width: 768,
    height: "auto",
    icon: LaptopIcon,
    label: "Medium",
  },
  large: {
    width: 1280,
    height: "auto",
    icon: DesktopIcon,
    label: "Large",
  },
  full: {
    width: "100%",
    height: "auto",
    icon: WidthIcon,
    label: "Full-width",
  },
} as const
type ViewPort = keyof typeof viewPorts

export const useViewPort = () => {
  const [currentViewport, setCurrentViewport] = useState<ViewPort>("full")

  return { currentViewport, setCurrentViewport }
}

export const PreviewHeading = ({
  currentViewport,
  setCurrentViewport,
  className,
}: {
  currentViewport: ViewPort
  setCurrentViewport: (ViewPort: ViewPort) => void
  className?: string
}) => {
  return (
    <div className={className} role="group" aria-label="Viewport size">
      {Object.entries(viewPorts).map(([value, { label, icon: Icon }]) => {
        const isSelected = currentViewport === value

        return (
          <Button
            key={value}
            title={label}
            aria-label={label}
            aria-selected={isSelected}
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isValidKey(value, viewPorts)) {
                setCurrentViewport(value)
              }
            }}
          >
            <Icon />
            <span className="sr-only">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}

export const Preview = ({
  currentViewport,
  className,
}: {
  currentViewport: ViewPort
  className?: string
}) => {
  const currentViewportWidth = viewPorts[currentViewport].width

  const { ref, scale, scaledHeight } = useFitZoom(currentViewportWidth)

  return (
    <div className={cn(className, "overflow-hidden")}>
      <div ref={ref} className="h-full w-full">
        <div
          className="bg-background shadow-foreground mx-auto h-full origin-top-left overflow-hidden shadow-[0_0_3px_1px]"
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

"use client"

import "@puckeditor/core/puck.css"

import { Puck } from "@puckeditor/core"

import { useState } from "react"

import { Button } from "@tohuhono/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tohuhono/ui/dropdown-menu"
import { cn, isValidKey } from "@tohuhono/utils"
import {
  MobileIcon,
  LaptopIcon,
  DesktopIcon,
  WidthIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons"
import { useFitZoom } from "../../hooks/use-fit-zoom"
import { type PreviewMode } from "./preview-iframe"

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

const previewModes: Record<PreviewMode, string> = {
  follow: "Follow",
  light: "Light",
  dark: "Dark",
}

export const useViewPort = () => {
  const [currentViewport, setCurrentViewport] = useState<ViewPort>("full")

  return { currentViewport, setCurrentViewport }
}

const ViewPortSwitcher = ({
  currentViewport,
  setCurrentViewport,
}: {
  currentViewport: ViewPort
  setCurrentViewport: (ViewPort: ViewPort) => void
}) => {
  return (
    <div role="group" aria-label="Viewport size" className="flex flex-row">
      {Object.entries(viewPorts).map(([value, { label, icon: Icon }]) => {
        const isSelected = currentViewport === value

        return (
          <Button
            key={value}
            title={label}
            aria-label={label}
            aria-selected={isSelected}
            variant="ghost"
            size="sm"
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

const PreviewModeSwitcher = ({
  previewMode,
  setPreviewMode,
}: {
  previewMode: PreviewMode
  setPreviewMode: (mode: PreviewMode) => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="align-middle"
          aria-label="Preview mode"
        >
          <SunIcon
            className={cn(
              "scale-100 rotate-0 transition-all",
              previewMode === "follow" && "dark:scale-0 dark:-rotate-90",
              previewMode === "dark" && "scale-0 -rotate-90",
            )}
          />
          <MoonIcon
            className={cn(
              "absolute scale-0 rotate-90 transition-all",
              previewMode === "follow" && "dark:scale-100 dark:rotate-0",
              previewMode === "dark" && "scale-100 rotate-0",
            )}
          />
          <span className="sr-only">Preview Theme switcher</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            aria-selected={previewMode === "light"}
            onClick={() => {
              setPreviewMode("light")
            }}
          >
            {previewModes.light}
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-selected={previewMode === "dark"}
            onClick={() => {
              setPreviewMode("dark")
            }}
          >
            {previewModes.dark}
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-selected={previewMode === "follow"}
            onClick={() => {
              setPreviewMode("follow")
            }}
          >
            {previewModes.follow}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const PreviewHeading = ({
  currentViewport,
  setCurrentViewport,
  previewMode,
  setPreviewMode,
  className,
}: {
  currentViewport: ViewPort
  setCurrentViewport: (ViewPort: ViewPort) => void
  previewMode: PreviewMode
  setPreviewMode: (mode: PreviewMode) => void
  className?: string
}) => {
  return (
    <div className={className}>
      <ViewPortSwitcher
        currentViewport={currentViewport}
        setCurrentViewport={setCurrentViewport}
      />
      <PreviewModeSwitcher
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
      />
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

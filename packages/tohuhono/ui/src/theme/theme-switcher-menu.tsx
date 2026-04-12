"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useMemo, useState } from "react"
import { cn } from "@tohuhono/utils"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { getMode, setMode } from "./mode-toggle"
import { ApplyTheme } from "./theme-editor"
import { fallbackTheme, themePresets } from "./themes"

export const ThemeSwitcherMenu = ({ className }: { className?: string }) => {
  const [selectedMode, setSelectedMode] = useState(getMode())
  const [selectedThemeId, setSelectedThemeId] = useState(
    themePresets[0]?.id ?? "",
  )

  const selectedTheme = useMemo(
    () => themePresets.find((preset) => preset.id === selectedThemeId)?.theme,
    [selectedThemeId],
  )

  const onModeClick = (mode: "light" | "dark" | "system") => {
    setSelectedMode(mode)
    setMode(mode)
  }

  return (
    <DropdownMenu>
      <ApplyTheme theme={selectedTheme ?? fallbackTheme} />
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("align-middle", className)}>
          <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Theme switcher</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid grid-cols-3 items-center gap-2 p-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "active w-full justify-self-center",
              selectedMode === "system" && "bg-accent text-accent-foreground",
            )}
            onClick={() => onModeClick("system")}
          >
            system
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "active w-full justify-self-center",
              selectedMode === "light" && "bg-accent text-accent-foreground",
            )}
            onClick={() => onModeClick("light")}
          >
            light
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "active w-full justify-self-center",
              selectedMode === "dark" && "bg-accent text-accent-foreground",
            )}
            onClick={() => onModeClick("dark")}
          >
            dark
          </Button>

          {themePresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className={cn(
                "col-span-3 justify-self-stretch",
                selectedThemeId === preset.id &&
                  "bg-accent text-accent-foreground",
              )}
              onClick={() => setSelectedThemeId(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

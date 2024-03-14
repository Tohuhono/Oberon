"use client"

import { ClipboardCopyIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useState, ChangeEvent, Fragment } from "react"
import { Button } from "src/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "src/components/dropdown-menu"
import { Label } from "src/components/label"
import { Input } from "src/components/input"
import { cn } from "@oberon/utils"
import { ApplyTheme, copyToClipboard } from "./theme-editor"
import { defaultTheme } from "./default-theme"
import { getMode, setMode } from "./mode-toggle"

export const ThemeEditorMenu = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState(defaultTheme)

  const [selectedMode, setSelectedMode] = useState(getMode())

  const onModeClick = (mode: "light" | "dark" | "system") => {
    setSelectedMode(mode)
    setMode(mode)
  }

  const onInputChange =
    (id: string, mode: "light" | "dark") =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setTheme(
        theme.map((t) => ({
          ...t,
          ...(t.id === id && {
            [mode]: event.currentTarget.value,
          }),
        })),
      )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("align-middle", className)}>
          <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid grid-cols-[max-content,max-content,max-content] items-center gap-x-2 gap-y-0 p-2 text-sm">
          <ApplyTheme theme={theme} />
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

          {theme.map(({ id, light, dark }) => {
            return (
              <Fragment key={id}>
                <Label>{id}</Label>
                <Input
                  className="border-0 px-2 py-0"
                  id={`${id}-light`}
                  size={15}
                  value={light || ""}
                  onChange={onInputChange(id, "light")}
                />
                <Input
                  className="border-0 px-2 py-0"
                  id={`${id}-dark`}
                  value={dark || ""}
                  size={15}
                  onChange={onInputChange(id, "dark")}
                />
              </Fragment>
            )
          })}
          <Button
            variant={"secondary"}
            className="col-span-3 justify-self-center"
            onClick={() => copyToClipboard(theme)}
          >
            <ClipboardCopyIcon className="h-max w-max pr-2" />
            Copy theme to clipboard
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

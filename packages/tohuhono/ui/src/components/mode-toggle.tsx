"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { cn } from "@tohuhono/utils"

import { useMode } from "@tohuhono/utils/use-mode"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { Button } from "../button"

export const ModeToggle = ({ className }: { className?: string }) => {
  const [mode, setMode] = useMode()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(className, "align-middle")}>
          <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            aria-selected={mode === "light"}
            onClick={() => setMode("light")}
          >
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-selected={mode === "dark"}
            onClick={() => setMode("dark")}
          >
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-selected={mode === "system"}
            onClick={() => setMode("system")}
          >
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

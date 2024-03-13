"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { Button } from "src/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/dropdown-menu"

export const setMode = (theme: "light" | "dark" | "system") => {
  if (theme === "system") {
    localStorage?.removeItem("theme")

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark")
    }
  }

  if (theme === "light") {
    localStorage?.setItem("theme", "light")
    document.documentElement.classList.remove("dark")
  }

  if (theme === "dark") {
    localStorage?.setItem("theme", "dark")
    document.documentElement.classList.add("dark")
  }
}

export const getMode = (): "light" | "dark" | "system" => {
  if (typeof localStorage !== "undefined" && localStorage.theme === "dark") {
    return "dark"
  }
  if (typeof localStorage !== "undefined" && localStorage.theme === "light") {
    return "light"
  }
  return "system"
}

export const ModeToggle = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="align-middle">
          <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

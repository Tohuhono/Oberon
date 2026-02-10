"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { Button } from "../button"

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
          <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
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

"use client"
import { useLayoutEffect } from "react"

const isDarkMode = () => {
  if (localStorage["oberon:theme"] === "dark") {
    return true
  }
  if (localStorage["oberon:theme"] === "light") {
    return false
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const AntifoucClient = () => {
  useLayoutEffect(() => {
    if (isDarkMode()) {
      return document.documentElement.classList.add("dark")
    }

    return document.documentElement.classList.remove("dark")
  }, [])

  return null
}

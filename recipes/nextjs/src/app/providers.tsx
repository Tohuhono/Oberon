"use client"

import { createContext, PropsWithChildren } from "react"
import { setMode } from "@/components/theme/mode-toggle"

export const ThemeContext = createContext({
  mode: {
    setMode: (_theme: "light" | "dark" | "system") => {},
  },
})

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeContext.Provider
      value={{
        mode: {
          setMode: (theme) => {
            setMode(theme)
          },
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

"use client"

import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"
import { createStyleRegistry, StyleRegistry } from "styled-jsx"
import { Theme } from "./default-theme"

declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

const StyledJsxRegistry = ({ children }: { children: React.ReactNode }) => {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [jsxStyleRegistry] = useState(() => createStyleRegistry())

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles()
    jsxStyleRegistry.flush()
    return <>{styles}</>
  })

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>
}

export const ApplyTheme = ({ theme }: { theme: Theme }) => (
  <StyledJsxRegistry>
    <style jsx global>
      {`
        :root {
          ${theme
            .map((t) => (t.light ? `  --${t.id}: ${t.light};` : ""))
            .join("\n")}
        }
        .dark {
          ${theme
            .map((t) => (t.dark ? `  --${t.id}: ${t.dark};` : ""))
            .join("\n")}
        }
      `}
    </style>
  </StyledJsxRegistry>
)

/* <style> requires a string literal to parse, repeat it here for copy to clipboard */
export const copyToClipboard = (theme: Theme) =>
  navigator.clipboard.writeText(`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      --nav-height: 3rem;
      --radius: 0.5rem;
  
      /* light */
      ${theme
        .map((t) => (t.light ? `  --${t.id}: ${t.light};` : ""))
        .join("\n")}
    }
    .dark {
      ${theme.map((t) => (t.dark ? `  --${t.id}: ${t.dark};` : "")).join("\n")}
    }
  }

  @layer base {
    * {
      @apply border-border;
    }
  }
`)

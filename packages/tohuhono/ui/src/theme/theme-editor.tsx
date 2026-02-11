"use client"

import { Theme } from "./default-theme"

export const ApplyTheme = ({ theme }: { theme: Theme }) => (
  <style>{`
    :root {
      ${theme
        .map(({ id, light }) => (light ? `  --${id}: ${light};` : ""))
        .join("\n")}
    }
    .dark {
      ${theme
        .map(({ id, dark }) => (dark ? `  --${id}: ${dark};` : ""))
        .join("\n")}
    }
  `}</style>
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
        .map(({ id, light }) => (light ? `  --${id}: ${light};` : ""))
        .join("\n")}
    }
    .dark {
      ${theme
        .map(({ id, dark }) => (dark ? `  --${id}: ${dark};` : ""))
        .join("\n")}
    }
  }

  @layer base {
    * {
      border-color: hsl(var(--border));
    }
  }
`)

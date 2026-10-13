import { AntifoucClient } from "./antifouc.client"

// Inline script to prevent fouc
// suppressHydrationWarning added to html tag
export const Antifouc = () => {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
  const isDarkMode = () => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false
    }
    if (localStorage['oberon:theme'] === "dark") {
      return true
    }
    if (localStorage['oberon:theme'] === "light") {
      return false
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  if (isDarkMode()) {
    document.documentElement.classList.add("dark");
  }
  `,
        }}
      />
      <AntifoucClient />
    </>
  )
}

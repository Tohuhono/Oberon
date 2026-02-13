import { Noto_Sans } from "next/font/google"

import { cn } from "@oberoncms/core"
const font = Noto_Sans({ subsets: ["latin"] })

export const metadata = {
  title: "Oberon CMS",
  description: "Built with puck by Tohuhono",
}

// Inline script to prevent fouc
// suppressHydrationWarning added to html tag
const ApplyMode = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
  const isDarkMode = () => {
    if (typeof localStorage !== "undefined" && localStorage.theme === "dark") {
      return true
    }
    if (typeof localStorage !== "undefined" && localStorage.theme === "light") {
      return false
    }
    return window?.matchMedia("(prefers-color-scheme: dark)").matches
  };
  if (isDarkMode()) {
    document.documentElement.classList.add("dark");
  }
  `,
    }}
  />
)

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <head>
        <ApplyMode />
      </head>
      <body className={cn(font.className, "bg-background text-foreground")}>
        {children}
      </body>
    </>
  )
}

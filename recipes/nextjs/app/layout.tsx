import "./globals.css"
import { Noto_Sans } from "next/font/google"

import { cn } from "@oberoncms/core"
import Script from "next/script"
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
    console.log('isDarkMode?')
    if (typeof localStorage !== "undefined" && localStorage.theme === "dark") {
      return true
    }
    if (typeof localStorage !== "undefined" && localStorage.theme === "light") {
      return false
    }
    console.log('isDarkMode matchMedia')
    return window?.matchMedia("(prefers-color-scheme: dark)").matches
  };
  if (isDarkMode()) {
    console.log('isDarkMode returned true')
    document.documentElement.classList.add("dark");
  }
  `,
    }}
  />
)

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="dark-mode" strategy="beforeInteractive">
          {`
  const isDarkMode3 = () => {
    console.log('isDarkMode3?')
    if (typeof localStorage !== "undefined" && localStorage.theme === "dark") {
      return true
    }
    if (typeof localStorage !== "undefined" && localStorage.theme === "light") {
      return false
    }
    console.log('isDarkMode3 matchMedia')
    return window?.matchMedia("(prefers-color-scheme: dark)").matches
  };
  if (isDarkMode3()) {
    console.log('isDarkMode3 returned true')
    document.documentElement.classList.add("dark");
  }          
          `}
        </Script>
        <ApplyMode />
      </head>
      <body className={cn(font.className, "bg-background text-foreground")}>
        {children}
      </body>
    </html>
  )
}

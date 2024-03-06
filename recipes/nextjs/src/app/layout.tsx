import "@/app/globals.css"
import { Montserrat } from "next/font/google"
import Providers from "./providers"
import { cn } from "@/lib/utils"
const font = Montserrat({ subsets: ["latin"] })

export const metadata = {
  title: "Any Old Type",
  description: "Discussing typescript types and any other unknowns",
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

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ApplyMode />
      </head>
      <body className={cn(font.className, "bg-background text-foreground")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

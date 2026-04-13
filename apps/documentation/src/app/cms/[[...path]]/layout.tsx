import { Noto_Sans } from "next/font/google"

import { Antifouc, cn } from "@oberoncms/core"
const font = Noto_Sans({ subsets: ["latin"] })

export const metadata = {
  title: "Oberon CMS",
  description: "Built with puck by Tohuhono",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <head>
        <Antifouc />
      </head>
      <body className={cn(font.className, "bg-background text-foreground")}>
        {children}
      </body>
    </>
  )
}

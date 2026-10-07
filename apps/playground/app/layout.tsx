import "./app.css"
import { Antifouc } from "@oberoncms/core"

export const metadata = {
  title: "Oberon CMS",
  description: "Built with puck by Tohuhono",
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Antifouc />
      </head>
      <body className="bg-background font-noto text-foreground">{children}</body>
    </html>
  )
}

import { Antifouc } from "@oberoncms/core"

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
      <body className="bg-background font-noto text-foreground">{children}</body>
    </>
  )
}

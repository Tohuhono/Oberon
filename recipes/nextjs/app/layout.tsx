import "./app.css";
import { Noto_Sans } from "next/font/google";

import { Antifouc, cn } from "@oberoncms/core";
const font = Noto_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Oberon CMS",
  description: "Built with puck by Tohuhono",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Antifouc />
      </head>
      <body className={cn(font.className, "bg-background text-foreground")}>
        {children}
      </body>
    </html>
  );
}

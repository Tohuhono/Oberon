import "@picocss/pico/css/pico.conditional.min.css"
import "@puckeditor/core/puck.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

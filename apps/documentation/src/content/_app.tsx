import "@/globals.css"
import type { AppProps } from "next/app"
import { Montserrat } from "next/font/google"

const font = Montserrat({ subsets: ["latin"] })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={font.className}>
      <Component {...pageProps} />
    </main>
  )
}

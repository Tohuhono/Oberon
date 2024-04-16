"use client"

import Script from "next/script"
import { Config } from "tailwindcss"
import { config } from "@oberon/dev/tailwind"

declare global {
  // eslint-disable-next-line no-var
  var tailwind: Config
  interface Window {
    tailwind?: Config
  }
}

export function DynamicTailwind() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://cdn.tailwindcss.com"
        onLoad={() => {
          window.tailwind.config = config
        }}
      />
    </>
  )
}

export function PreviewFrameTailwind() {
  return (
    <Script
      strategy="afterInteractive"
      id="PreviewScript"
      onReady={() => {
        const iframe: HTMLIFrameElement | null =
          document.querySelector("#preview-frame")

        if (!iframe?.contentDocument) {
          return
        }
        const tailwindCDN = iframe.contentDocument.createElement("script")
        tailwindCDN.setAttribute("src", "https://cdn.tailwindcss.com")
        tailwindCDN.addEventListener("load", () => {
          if (iframe.contentWindow?.tailwind) {
            iframe.contentWindow.tailwind.config = config
          }
        })
        iframe.contentDocument.head.appendChild(tailwindCDN)
      }}
    >{`console.log('Loading Tailwind CSS from cdn - will be replaced in production');`}</Script>
  )
}

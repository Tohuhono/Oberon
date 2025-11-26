"use client"

import Script from "next/script"
import { Config } from "tailwindcss"
import { config } from "@tohuhono/dev/tailwind.config"
import { useEffect, useRef } from "react"

declare global {
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
        id="dynamic-tailwind"
        onLoad={() => {
          window.tailwind.config = config
        }}
      />
    </>
  )
}

// Make sure font, theme and mode are propgated to preview iframe
export function PreviewFrameTailwind() {
  const darkModeObserver = useRef<MutationObserver>(null)

  useEffect(() => {
    const iframe: HTMLIFrameElement | null =
      document.querySelector("#preview-frame")

    if (!iframe?.contentDocument) {
      console.warn("no preview iframe found")
      return
    }

    if (!iframe.contentDocument.getElementById("preview-frame-tailwind")) {
      const tailwindCDN = iframe.contentDocument.createElement("script")
      tailwindCDN.setAttribute("id", "preview-frame-tailwind")
      tailwindCDN.setAttribute("src", "https://cdn.tailwindcss.com")
      tailwindCDN.addEventListener("load", () => {
        if (iframe.contentWindow?.tailwind) {
          iframe.contentWindow.tailwind.config = config
        }
      })
      iframe.contentDocument.head.appendChild(tailwindCDN)
    }

    iframe.contentDocument.body.classList.add(...document.body.classList)

    if (document.documentElement.classList.contains("dark")) {
      iframe?.contentDocument?.documentElement.classList.add("dark")
    } else {
      iframe?.contentDocument?.documentElement.classList.remove("dark")
    }

    darkModeObserver.current = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (document.documentElement.classList.contains("dark")) {
            iframe?.contentDocument?.documentElement.classList.add("dark")
          } else {
            iframe?.contentDocument?.documentElement.classList.remove("dark")
          }
        }
      }
    })

    darkModeObserver.current.observe(document.documentElement, {
      attributes: true,
    })

    return () => {
      darkModeObserver.current?.disconnect()
    }
  })

  return null
}

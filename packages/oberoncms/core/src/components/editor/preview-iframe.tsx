"use client"

import "@puckeditor/core/puck.css"

import { useEffect, type PropsWithChildren } from "react"

export type PreviewMode = "light" | "dark" | "follow"

const iframeTailwindSrc = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"

export const PreviewIframe = ({
  children,
  iframeDocument,
  previewMode,
}: PropsWithChildren<{
  iframeDocument?: Document
  previewMode: PreviewMode
}>) => {
  useEffect(() => {
    if (!iframeDocument) {
      return
    }

    if (!iframeDocument.getElementById("preview-frame-tailwind")) {
      const tailwindScript = iframeDocument.createElement("script")
      tailwindScript.setAttribute("id", "preview-frame-tailwind")
      tailwindScript.setAttribute("src", iframeTailwindSrc)
      iframeDocument.head.appendChild(tailwindScript)
    }

    iframeDocument.body.classList.add(...document.body.classList)

    const syncPreviewTheme = () => {
      const shouldUseDarkMode =
        previewMode === "dark" ||
        (previewMode === "follow" &&
          document.documentElement.classList.contains("dark"))

      iframeDocument.documentElement.classList.toggle("dark", shouldUseDarkMode)
    }

    syncPreviewTheme()

    if (previewMode !== "follow") {
      return
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          syncPreviewTheme()
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
    }
  }, [iframeDocument, previewMode])

  return <>{children}</>
}

"use client"

import Script from "next/script"
import { Config } from "tailwindcss"

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
        id="dynamic-tailwind"
        strategy="afterInteractive"
        src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
      />
    </>
  )
}

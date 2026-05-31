"use client"

import { Config } from "tailwindcss"

declare global {
  var tailwind: Config
  interface Window {
    tailwind?: Config
  }
}

export function DynamicTailwind() {
  return (
    <script id="dynamic-tailwind" src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" async />
  )
}

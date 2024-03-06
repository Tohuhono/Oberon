"use client"

import Script from "next/script"
import { Config } from "tailwindcss"
import config from "tailwind.config"

declare global {
  // eslint-disable-next-line no-var
  var tailwind: Config
}

export function DynamicTailwind() {
  return (
    <Script
      strategy="lazyOnload"
      src="https://cdn.tailwindcss.com"
      onLoad={() => {
        if (typeof window !== undefined) {
          tailwind.config = config
        }
      }}
    />
  )
}

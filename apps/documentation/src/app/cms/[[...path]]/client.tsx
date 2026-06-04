"use client"

import { OberonClient } from "@oberoncms/core/editor"
import { NextOberonClientProvider } from "@oberoncms/plugin-nextjs/client"

import { clientConfig } from "@/oberon/client.config"

export function Client() {
  return (
    <NextOberonClientProvider>
      <OberonClient config={clientConfig} />
    </NextOberonClientProvider>
  )
}

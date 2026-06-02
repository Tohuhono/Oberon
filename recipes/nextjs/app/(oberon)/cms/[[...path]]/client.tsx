"use client"

import { OberonClient } from "@oberoncms/core/editor"

import { clientConfig } from "@/oberon/client.config"

export function Client() {
  return <OberonClient config={clientConfig} />
}

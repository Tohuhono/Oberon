"use client"

import { OberonClient } from "@oberoncms/core/editor"

import { config } from "@/app/(oberon)/component-config"

export function Client() {
  return <OberonClient config={config} />
}

"use client"

import { OberonClient } from "@oberoncms/core/editor"

import { config } from "@/app/(oberon)/client-config"

export function Client() {
  return <OberonClient config={config} />
}

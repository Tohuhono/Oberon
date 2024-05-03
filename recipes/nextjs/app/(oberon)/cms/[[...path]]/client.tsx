"use client"

import { OberonClient, type OberonServerProps } from "@oberoncms/core/editor"

import { config } from "@/app/(oberon)/client-config"

export function Client(props: OberonServerProps) {
  return <OberonClient config={config} {...props} />
}

"use client"
import { OberonClient, type OberonServerProps } from "@oberon/core/editor"

import { config } from "../../config"

export const Client = (props: OberonServerProps) => (
  <OberonClient config={config} {...props} />
)

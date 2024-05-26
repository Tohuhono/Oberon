"use client"

import { Render } from "@oberoncms/core/render"
import { actions } from "../actions"
import { config } from "../config"

export function Client({ path }: { path?: string[] }) {
  return <Render path={path} actions={actions} config={config} />
}

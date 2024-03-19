"use client"
import { Oberon } from "@oberon/core/editor"
import type { Actions } from "@oberon/core"
import { config } from "../../config"

export const Client = ({
  slug,
  actions,
}: {
  slug: string[]
  actions: Actions
}) => <Oberon slug={slug} actions={actions} config={config} />

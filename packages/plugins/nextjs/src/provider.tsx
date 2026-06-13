import { OberonProvider } from "@oberoncms/core/provider"
import type { ComponentProps } from "react"

import { NextOberonClientProvider } from "./provider.client"

export function NextOberonProvider(props: ComponentProps<typeof OberonProvider>) {
  return <OberonProvider {...props} ClientProvider={NextOberonClientProvider} />
}

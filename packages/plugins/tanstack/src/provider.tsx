import { OberonProvider } from "@oberoncms/core/provider"
import type { ComponentProps } from "react"

import { TanstackOberonClientProvider } from "./provider.client"

export function TanstackOberonProvider(props: ComponentProps<typeof OberonProvider>) {
  return <OberonProvider {...props} ClientProvider={TanstackOberonClientProvider} />
}

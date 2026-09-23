import type { OberonClientContext } from "@oberoncms/core"
import { OberonClient } from "@oberoncms/core/editor"
import { TanstackOberonClientProvider } from "@oberoncms/plugin-tanstack/provider/client"

import { actions } from "./actions"
import { clientConfig } from "./client.config"

export function CmsClient({ context }: { context: OberonClientContext }) {
  return (
    <TanstackOberonClientProvider serverActions={actions} context={context}>
      <OberonClient config={clientConfig} />
    </TanstackOberonClientProvider>
  )
}

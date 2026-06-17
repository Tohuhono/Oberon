import { Render } from "@puckeditor/core"
import { createFileRoute } from "@tanstack/react-router"

import { adapter } from "../../oberon/adapter"
import { clientConfig } from "../../oberon/client.config"

async function OberonRender() {
  const data = await adapter.getPageData("/")

  if (!data) {
    return adapter.notFound()
  }

  return <Render data={data} config={{ components: clientConfig.components }} />
}

export const Route = createFileRoute("/")({ component: OberonRender })

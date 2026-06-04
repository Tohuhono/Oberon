import { DynamicTailwind } from "@tohuhono/ui/theme"
import type { PropsWithChildren } from "react"

import { Editor } from "./components/editor"
import { Images } from "./components/images"
import { Login } from "./components/login"
import { Menu } from "./components/menu"
import { Pages } from "./components/pages"
import { Preview } from "./components/preview"
import { Site } from "./components/site"
import { Users } from "./components/users"
import { useOberonClientContext } from "./hooks/use-oberon"
import type { OberonClientConfig } from "./lib/dtd"
import { getTitle } from "./lib/utils"

export { useOberonImages } from "./hooks/use-oberon-images"

const previewConfig = {
  root: {
    render: ({ children }: PropsWithChildren) => (
      <>
        <DynamicTailwind />
        {children}
      </>
    ),
  },
}

export function OberonClient({ config }: { config: OberonClientConfig }) {
  const { action, data, slug } = useOberonClientContext()

  if (action === "login") {
    return <Login {...data} />
  }

  if (action === "edit") {
    return <Editor path={slug} data={data} config={config} />
  }

  if (action === "preview") {
    return <Preview path={slug} data={data} config={{ ...previewConfig, ...config }} />
  }

  if (["users", "images", "pages", "site"].includes(action)) {
    return (
      <>
        {/* TODO fix path to be dynamic */}
        <Menu title={getTitle(action, slug)} path={`/cms/${action}`} />
        <div className="flex w-full justify-center">
          <div
            className="
              prose w-full rounded-sm bg-card p-3 pb-10 text-card-foreground
              lg:prose-lg lg:p-5 lg:pb-10
              dark:prose-invert
            "
          >
            {action === "users" && <Users users={data} />}
            {action === "images" && <Images images={data} />}
            {action === "pages" && <Pages pages={data} />}
            {action === "site" && <Site config={data} />}
          </div>
        </div>
      </>
    )
  }

  throw new Error(`Unknown Oberon client action: ${String(action)}`)
}

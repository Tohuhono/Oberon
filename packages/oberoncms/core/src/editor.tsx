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
import { useOberonClient, useOberonNavigation } from "./hooks/use-oberon"
import type { OberonClientConfig } from "./lib/dtd"
import { getTitle } from "./lib/utils"

export { useOberonImages } from "./hooks/use-oberon-images"
export { useOberonActions, useOberonNavigation } from "./hooks/use-oberon"
export { clearLocalData, useLocalData } from "./hooks/use-local-data"
export { Editor as PageEditor } from "./components/editor"
export { Preview as PagePreview } from "./components/preview"
export { Menu as EditorMenu } from "./components/menu"
export { HistoryControls as EditorHistory } from "./components/editor/history"

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
  const { action, data, slug } = useOberonClient()
  const { notFound } = useOberonNavigation()

  if (action === "login") {
    return <Login key={JSON.stringify([data.email, data.token])} {...data} />
  }

  if (action === "edit") {
    const AuthoringEditor = config.authoring?.Editor ?? Editor
    return <AuthoringEditor path={slug} data={data} config={config} />
  }

  if (action === "preview") {
    const AuthoringPreview = config.authoring?.Preview ?? Preview
    return <AuthoringPreview path={slug} data={data} config={{ ...previewConfig, ...config }} />
  }

  if (action === "library") {
    const Library = config.authoring?.Library
    return Library ? <Library config={config} /> : notFound()
  }

  if (["users", "images", "pages", "site"].includes(action)) {
    return (
      <>
        {/* TODO fix path to be dynamic */}
        <Menu
          title={getTitle(action, slug)}
          path={`/cms/${action}`}
          libraryLabel={
            config.authoring?.Library ? (config.authoring.label ?? "Library") : undefined
          }
        />
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
            {action === "pages" && <Pages pages={data} config={config} />}
            {action === "site" && <Site config={data} />}
          </div>
        </div>
      </>
    )
  }

  return notFound()
}

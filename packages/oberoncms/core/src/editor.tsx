import { DynamicTailwind } from "@tohuhono/ui/theme"
import { notFound } from "next/navigation"
import type { PropsWithChildren } from "react"
import type { OberonConfig } from "./lib/dtd"
import { getTitle } from "./lib/utils"
import { useOberonClientContext } from "./hooks/use-oberon"
import { Editor } from "./components/editor"
import { Preview } from "./components/preview"
import { Menu } from "./components/menu"
import { Pages } from "./components/pages"
import { Images } from "./components/images"
import { Users } from "./components/users"
import { Site } from "./components/site"
import { Login } from "./components/login"

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

export function OberonClient({ config }: { config: OberonConfig }) {
  const { action, data, slug } = useOberonClientContext()

  if (action === "login") {
    return <Login {...data} />
  }

  if (action === "edit") {
    return <Editor path={slug} data={data} config={config} />
  }

  if (action === "preview") {
    return (
      <Preview
        path={slug}
        data={data}
        config={{ ...previewConfig, ...config }}
      />
    )
  }

  if (["users", "images", "pages", "site"].includes("pages")) {
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

  notFound()
}

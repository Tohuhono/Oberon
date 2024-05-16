import type { Config } from "@measured/puck"
import { DynamicTailwind, PreviewFrameTailwind } from "@tohuhono/ui/theme"
import type { OberonConfig } from "./app/schema"
import { getTitle } from "./app/utils"
import { useOberonClientContext } from "./hooks/use-oberon"
import { Editor } from "./components/editor"
import { Preview } from "./components/preview"
import { PuckMenu } from "./components/puck-menu"
import { AllPages } from "./components/all-pages"
import { Images } from "./components/images"
import { Users } from "./components/users"
import { SiteSettings } from "./components/site-settings"

export { useOberonImages } from "./hooks/use-oberon-images"

const editorConfig: Partial<Config> = {
  root: {
    render: ({ children }) => (
      <>
        <PreviewFrameTailwind />
        {children}
      </>
    ),
  },
}

const previewConfig: Partial<Config> = {
  root: {
    render: ({ children }) => (
      <>
        <DynamicTailwind />
        {children}
      </>
    ),
  },
}

export function OberonClient({
  config: { components },
}: {
  config: OberonConfig
}) {
  const { action, data, slug } = useOberonClientContext()

  if (action === "edit") {
    return (
      <Editor
        path={slug}
        data={data}
        config={{ ...editorConfig, components: components }}
      />
    )
  }

  if (action === "preview") {
    return (
      <Preview
        path={slug}
        data={data}
        config={{ ...previewConfig, components: components }}
      />
    )
  }

  return (
    <>
      {/* TODO fix path to be dynamic */}
      <PuckMenu title={getTitle(action, slug)} path={`/cms/${action}`} />
      <div className="flex w-full justify-center">
        <div className="prose w-full rounded bg-secondary p-3 pb-10 dark:prose-invert lg:prose-lg lg:p-5 lg:pb-10">
          {action === "users" && <Users users={data} />}
          {action === "images" && <Images images={data} />}
          {action === "pages" && <AllPages pages={data} />}
          {action === "site" && <SiteSettings config={data} />}
        </div>
      </div>
    </>
  )
}

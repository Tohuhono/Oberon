import type { Config, Data } from "@measured/puck"
import { DynamicTailwind, PreviewFrameTailwind } from "@tohuhono/ui/theme"
import type {
  OberonImage,
  OberonUser,
  OberonConfig,
  OberonServerActions,
  OberonPage,
} from "./app/schema"
import { getTitle } from "./app/utils"
import { OberonProvider } from "./components/provider"
import { Editor } from "@/components/editor"
import { Preview } from "@/components/preview"
import { PuckMenu } from "@/components/puck-menu"
import { AllPages } from "@/components/all-pages"
import { Images } from "@/components/images"
import { Users } from "@/components/users"

export { useOberonImages } from "./hooks/use-oberon-images"

type DescriminatedProps =
  | { action: "edit" | "preview"; data: Data | null }
  | { action: "users"; data: OberonUser[] }
  | { action: "images"; data: OberonImage[] }
  | { action: "pages"; data: OberonPage[] }

export type OberonServerProps = DescriminatedProps & {
  actions: OberonServerActions
  slug: string
}

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

function Client({
  action,
  data,
  slug,
  config: { blocks },
}: DescriminatedProps & {
  config: OberonConfig
  slug: string
}) {
  if (action === "edit") {
    return (
      <Editor
        path={slug}
        data={data}
        config={{ ...editorConfig, components: blocks }}
      />
    )
  }

  if (action === "preview") {
    return (
      <Preview
        path={slug}
        data={data}
        config={{ ...previewConfig, components: blocks }}
      />
    )
  }

  return (
    <>
      {/* TODO fix path to be dynamic */}
      <PuckMenu title={getTitle(action, slug)} path={`/cms/${action}`} />
      {action === "users" && <Users users={data} />}
      {action === "images" && <Images images={data} />}
      {action === "pages" && <AllPages pages={data} />}
    </>
  )
}

export function OberonClient({
  actions,
  ...props
}: OberonServerProps & {
  config: OberonConfig
}) {
  return (
    <OberonProvider actions={actions}>
      <Client {...props} />
    </OberonProvider>
  )
}

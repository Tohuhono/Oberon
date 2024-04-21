import type { Data } from "@measured/puck"
import { DynamicTailwind, PreviewFrameTailwind } from "@oberon/ui/theme"
import type {
  OberonImage,
  OberonUser,
  OberonConfig,
  OberonAdapter,
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
  adapter: OberonAdapter
  slug: string
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
        config={{
          root: {
            render: ({ children }) => (
              <>
                <PreviewFrameTailwind />
                {children}
              </>
            ),
          },
          components: blocks,
        }}
      />
    )
  }

  if (action === "preview") {
    return (
      <Preview
        path={slug}
        data={data}
        config={{
          root: {
            render: ({ children }) => (
              <>
                <DynamicTailwind />
                {children}
              </>
            ),
          },
          components: blocks,
        }}
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
  adapter,
  ...props
}: OberonServerProps & {
  config: OberonConfig
}) {
  return (
    <OberonProvider adapter={adapter}>
      <Client {...props} />
    </OberonProvider>
  )
}

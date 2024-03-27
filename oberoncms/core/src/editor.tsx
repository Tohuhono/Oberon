import type { Route } from "next"
import type { Data } from "@measured/puck"
import type { ServerActions, Asset, User, OberonConfig } from "./app/schema"
import { getTitle } from "./app/utils"
import { Editor } from "@/components/editor"
import { Preview } from "@/components/preview"
import { PuckMenu } from "@/components/puck-menu"
import { AllPages } from "@/components/all-pages"
import { Assets } from "@/components/assets"
import { Users } from "@/components/users"

type DescriminatedProps =
  | { action: "edit" | "preview"; data: Data | null }
  | { action: "users"; data: User[] }
  | { action: "assets"; data: Asset[] }
  | { action: "pages"; data: Route[] }

export type OberonServerProps = DescriminatedProps & {
  slug: string
  actions: ServerActions
}

export function OberonClient({
  action,
  data,
  slug,
  config: { blocks },
  actions: {
    publishPageData,
    addUser,
    changeRole,
    deleteUser,
    deleteAsset,
    deletePage,
  },
}: OberonServerProps & {
  config: OberonConfig
}) {
  if (action === "edit") {
    return (
      <Editor
        path={slug}
        data={data}
        config={{ components: blocks }}
        publishPageData={publishPageData}
      />
    )
  }

  if (action === "preview") {
    return <Preview path={slug} data={data} config={{ components: blocks }} />
  }

  return (
    <>
      {/* TODO fix path to be dynamic */}
      <PuckMenu title={getTitle(action, slug)} path={`/cms/${action}`} />
      {action === "users" && (
        <Users
          users={data}
          addUser={addUser}
          changeRole={changeRole}
          deleteUser={deleteUser}
        />
      )}
      {action === "assets" && (
        <Assets assets={data} deleteAsset={deleteAsset} />
      )}
      {action === "pages" && <AllPages routes={data} deletePage={deletePage} />}
    </>
  )
}

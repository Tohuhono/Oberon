import { getTitle } from "@oberon/utils"
import type { Metadata } from "next"
import type { Config } from "@measured/puck"
import type { Actions, OberonConfig } from "../schema"
import { Editor } from "@/components/editor"
import { Preview } from "@/components/preview"
import { PuckMenu } from "@/components/puck-menu"
import { AllPages } from "@/components/all-pages"
import { Assets } from "@/components/assets"
import { Users } from "@/components/users"

export function getMetaData(
  slug: string[] = [],
  { resolvePath }: Actions,
): Metadata {
  const route = slug[0] || ""
  const path = resolvePath(slug.slice(1))
  return {
    title: getTitle(route, path),
  }
}

export async function PuckClient({
  route,
  path,
  config,
  actions: {
    getPageData,
    getAllUsers,
    getAllKeys,
    getAllAssets,
    publishPageData,
    addUser,
    changeRole,
    deleteUser,
    deleteAsset,
    deletePage,
  },
}: {
  route: string
  path: string
  config: Config
  actions: Actions
}) {
  if (route === "edit") {
    return (
      <Editor
        path={path}
        data={await getPageData(path)}
        config={config}
        publishPageData={async (props) => {
          "use server"
          return publishPageData(props)
        }}
      />
    )
  }

  if (route === "preview") {
    return (
      <Preview path={path} data={await getPageData(path)} config={config} />
    )
  }

  return (
    <>
      <PuckMenu title={getTitle(route, path)} path={`/cms${route}`} />
      {route === "users" && (
        <Users
          users={await getAllUsers()}
          addUser={async (data) => {
            "use server"
            return addUser(data)
          }}
          changeRole={async (data) => {
            "use server"
            return changeRole(data)
          }}
          deleteUser={async (data) => {
            "use server"
            return deleteUser(data)
          }}
        />
      )}
      {route === "assets" && (
        <Assets
          assets={await getAllAssets()}
          deleteAsset={async (key) => {
            "use server"
            return deleteAsset(key)
          }}
        />
      )}
      {(route === "pages" || !route) && (
        <AllPages
          keys={await getAllKeys()}
          deletePage={async (key) => {
            "use server"
            return deletePage(key)
          }}
        />
      )}
    </>
  )
}

export async function Oberon({
  slug = [],
  actions,
  config: { blocks },
}: {
  slug?: string[]
  config: OberonConfig
  actions: Actions
}) {
  const route = slug[0] || ""
  const path = actions.resolvePath(slug.slice(1))

  return (
    <PuckClient
      route={route}
      path={path}
      config={{ components: blocks }}
      actions={actions}
    />
  )
}

import { Config } from "@measured/puck"
import { Editor } from "src/components/editor"
import { Preview } from "src/components/preview"
import { PuckMenu } from "src/components/puck-menu"
import { AllPages } from "src/components/all-pages"
import { Assets } from "src/components/assets"
import { Users } from "src/components/users"
import { getTitle } from "@oberon/utils"
import type { Metadata } from "next"
import type { Actions } from "../schema"
import { resolvePuckPath } from "./resolve-puck-path"
import { clientConfig } from "./clientConfig"

export async function generateMetadata({
  params: { puckPath = [] },
}: {
  params: { puckPath: string[] }
}): Promise<Metadata> {
  const route = puckPath[0] || ""
  const path = resolvePuckPath(puckPath.slice(1))

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
  console.log("route", route, "path", path)

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

export async function Client({
  slug = [],
  actions,
}: {
  slug?: string[]
  actions: Actions
}) {
  const route = slug[0] || ""
  const path = resolvePuckPath(slug.slice(1))

  return (
    <PuckClient
      route={route}
      path={path}
      config={clientConfig}
      actions={actions}
    />
  )
}

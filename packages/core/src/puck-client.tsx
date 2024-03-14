import { Config } from "@measured/puck"
import { Editor } from "src/components/editor"
import { Preview } from "src/components/preview"
import { PuckMenu } from "src/components/puck-menu"
import { AllPages } from "src/components/all-pages"
import { Assets } from "src/components/assets"
import { Users } from "src/components/users"
import { getTitle } from "@oberon/utils"
import type { Metadata } from "next"
import type { Actions } from "./schema"
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
  actions,
}: {
  route: string
  path: string
  config: Config
  actions: Actions
}) {
  const { getPageData, getAllUsers, getAllKeys, getAllAssets } = actions

  if (route === "edit") {
    return (
      <Editor
        path={path}
        data={await getPageData(path)}
        config={config}
        actions={actions}
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
        <Users users={await getAllUsers()} actions={actions} />
      )}
      {route === "assets" && (
        <Assets assets={await getAllAssets()} actions={actions} />
      )}
      {(route === "pages" || !route) && (
        <AllPages keys={await getAllKeys()} actions={actions} />
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

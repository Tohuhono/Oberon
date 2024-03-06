import { Config } from "@measured/puck"
import {
  getAllAssets,
  getAllKeys,
  getAllUsers,
  getPageData,
} from "@/puck/src/actions"
import { Editor } from "@/puck/src/components/editor"
import { Preview } from "@/puck/src/components/preview"
import { PuckMenu } from "@/puck/src/components/puck-menu"
import { AllPages } from "@/puck/src/components/all-pages"
import { Assets } from "@/puck/src/components/assets"
import { Users } from "@/puck/src/components/users"
import { getTitle } from "@/puck/utils"

export async function PuckClient({
  route,
  path,
  config,
}: {
  route: string
  path: string
  config: Config
}) {
  if (route === "edit") {
    return <Editor path={path} data={await getPageData(path)} config={config} />
  }

  if (route === "preview") {
    return (
      <Preview path={path} data={await getPageData(path)} config={config} />
    )
  }

  return (
    <>
      <PuckMenu title={getTitle(route, path)} path={`/cms${route}`} />
      {route === "users" && <Users users={await getAllUsers()} />}
      {route === "assets" && <Assets assets={await getAllAssets()} />}
      {(route === "pages" || !route) && <AllPages keys={await getAllKeys()} />}
    </>
  )
}

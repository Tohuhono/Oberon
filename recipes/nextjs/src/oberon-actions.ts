import { Data } from "@measured/puck"

import { eq } from "drizzle-orm"
import { Route } from "next"
import { revalidatePath, unstable_cache } from "next/cache"
import {
  ChangeRoleSchema,
  DeleteUserSchema,
  AddUserSchema,
  Actions,
} from "@oberon/core"

// import { ourUploadthing } from "src/puck/uploadthing/api" // TODO uploadthing
import { adapter } from "./auth/next-auth-adapter"
import { db } from "src/db/client"
import { assets, pages, users } from "src/db/schema"

const cache = unstable_cache

/*
 * Page actions
 */
const getAllPathsCached = cache(async () => {
  const result = await db.select({ key: pages.key }).from(pages)
  const data = result.map((row) => ({
    puckPath: row["key"].split("/").slice(1),
  }))
  return data
})
export const getAllPaths: Actions["getAllPaths"] = async () => {
  "use server"
  return getAllPathsCached()
}

const getAllKeysCached = cache(async () => {
  const sortPages = (a: { key: string }, b: { key: string }) => {
    if (a.key < b.key) {
      return -1
    }
    if (a.key > b.key) {
      return 1
    }
    return 0
  }
  const result = await db.select({ key: pages.key }).from(pages)
  const data = result.sort(sortPages).map(({ key }) => key as Route)
  return data
})
export const getAllKeys: Actions["getAllKeys"] = async () => {
  "use server"
  return getAllKeysCached()
}

// TODO zod ; maybeGet
const getPageDataCached = cache(async (url: string) => {
  const result = await db
    .select({
      data: pages.data,
    })
    .from(pages)
    .where(eq(pages.key, url))

  const data = result[0]?.data

  return data ? (JSON.parse(data) as Data) : undefined
})
export const getPageData: Actions["getPageData"] = async (url) => {
  "use server"
  return getPageDataCached(url)
}

// TODO zod ; return value
export const publishPageData: Actions["publishPageData"] = async ({
  key,
  data,
}) => {
  "use server"
  const dataJSON = JSON.stringify(data)
  await db
    .insert(pages)
    .values({ key, data: dataJSON })
    .onConflictDoUpdate({ target: pages.key, set: { data: dataJSON } })

  console.log(`Revalidating ${key}`)
  revalidatePath(key)
}

// TODO zod ; return value
export const deletePage: Actions["deletePage"] = async (key) => {
  "use server"
  await db.delete(pages).where(eq(pages.key, key))
  revalidatePath(key)
}

/*
 * Asset actions
 */

export const getAllAssets: Actions["getAllAssets"] = async () => {
  "use server"
  const allAssets = await db
    .select({
      key: assets.key,
      name: assets.name,
      url: assets.url,
      size: assets.size,
    })
    .from(assets)
    .execute()
  return allAssets || []
}

// TODO uploadthing
/*
export const deleteAsset = async (data: Pick<Asset, "key">) => { 
  const { key } = DeleteAssetSchema.parse(data)
  try {
    await ourUploadthing.deleteFiles(key)
    await db.delete(assets).where(eq(assets.key, key))
    return key
  } catch (_error) {
    console.error("Delete asset failed")
    return null
  }
}
*/

/*
 * User actions
 */
export const getAllUsers: Actions["getAllUsers"] = async () => {
  "use server"
  const allUsers = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .execute()
  return allUsers || []
}

export const changeRole: Actions["changeRole"] = async (data: unknown) => {
  "use server"
  const { role, id } = ChangeRoleSchema.parse(data)
  try {
    await db.update(users).set({ role }).where(eq(users.id, id))
    return { role, id }
  } catch (_error) {
    console.error("Change role failed")
    return undefined
  }
}

export const deleteUser: Actions["deleteUser"] = async (data: unknown) => {
  "use server"
  const { id } = DeleteUserSchema.parse(data)
  try {
    await adapter.deleteUser(id)
    return { id }
  } catch (_error) {
    console.error("Delete user failed")
    return undefined
  }
}

export const addUser: Actions["addUser"] = async (data: unknown) => {
  "use server"
  const { email, role } = AddUserSchema.parse(data)

  try {
    const { id } = await adapter.createUser({
      email,
      // @ts-expect-error TODO fix global auth
      role,
      emailVerified: null,
    })
    return { id, email, role }
  } catch (_error) {
    console.error("Create user failed")
    return undefined
  }
}

export const actions = {
  addUser,
  deleteUser,
  changeRole,
  getAllUsers,
  getAllAssets,
  deletePage,
  publishPageData,
  getPageData,
  getAllKeys,
  getAllPaths,
}

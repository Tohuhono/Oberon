import "use-server"

import type { Data } from "@measured/puck"
import { eq } from "drizzle-orm"
import {
  revalidatePath,
  revalidateTag,
  unstable_cache as cache,
} from "next/cache"
import {
  ChangeRoleSchema,
  DeleteUserSchema,
  AddUserSchema,
  OberonAdapter,
  ImageSchema,
  INITIAL_DATA,
  type AdapterActionGroup,
  type AdapterPermission,
  PageSchema,
  DeletePageSchema,
} from "@oberoncms/core"

// import { ourUploadthing } from "src/puck/uploadthing/api" // TODO uploadthing
import { db } from "src/db/client"
import { images, pages, users } from "src/db/schema"

import { auth } from "@/auth"
import { adapter as authAdapter } from "@/db/next-auth-adapter"

const permissions: Record<
  "unauthenticated" | "user",
  Partial<Record<AdapterActionGroup, AdapterPermission>>
> = {
  unauthenticated: {
    pages: "read",
  },
  user: {
    cms: "read",
    pages: "write",
    images: "write",
  },
}

const can: OberonAdapter["can"] = async (action, permission = "read") => {
  "use server"
  // Check unauthenticated first so we can do it outside of request context
  if (
    permissions.unauthenticated[action] === permission ||
    permissions.unauthenticated[action] === "write"
  ) {
    return true
  }

  const session = await auth()

  // Authentication will throw if used outside of request context
  // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
  switch (session?.user?.role) {
    case "user":
      return (
        permissions.user[action] === permission ||
        permissions.user[action] === "write"
      )
    case "admin":
      return true
    default:
      return false
  }
}

const will = async (
  action: AdapterActionGroup,
  permission: AdapterPermission,
) => {
  if (await can(action, permission)) {
    return
  }
  throw new Error("Unauthorized")
}

/*
 * Page actions
 */
const getAllPathsCached = cache(
  async () => {
    const result = await db.select({ key: pages.key }).from(pages)
    const data = result.map((row) => ({
      puckPath: row["key"].split("/").slice(1),
    }))
    return data
  },
  undefined,
  { tags: ["oberon-pages"] },
)
const getAllPaths: OberonAdapter["getAllPaths"] = async () => {
  "use server"
  await will("pages", "read")
  return getAllPathsCached()
}

const getAllPagesCached = cache(
  async () => {
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
    const data = result.sort(sortPages)
    return data
  },
  undefined,
  { tags: ["oberon-pages"] },
)
const getAllPages: OberonAdapter["getAllPages"] = async () => {
  "use server"
  await will("pages", "read")
  return getAllPagesCached()
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

  return data ? (JSON.parse(data) as Data) : null
})
const getPageData: OberonAdapter["getPageData"] = async (url) => {
  "use server"
  await will("pages", "read")
  return getPageDataCached(url)
}

// TODO return value
const addPage: OberonAdapter["addPage"] = async (data: unknown) => {
  "use server"
  await will("pages", "write")
  const { key } = PageSchema.parse(data)
  const dataJSON = JSON.stringify(INITIAL_DATA)
  await db.insert(pages).values({ key, data: dataJSON })
  revalidatePath(key)
  revalidateTag("oberon-pages")
}

// TODO return value
const deletePage: OberonAdapter["deletePage"] = async (data) => {
  "use server"
  await will("pages", "write")
  const { key } = DeletePageSchema.parse(data)
  await db.delete(pages).where(eq(pages.key, key))
  revalidatePath(key)
  revalidateTag("oberon-pages")
}

// TODO zod ; return value
const publishPageData: OberonAdapter["publishPageData"] = async ({
  key,
  data,
}) => {
  "use server"
  await will("pages", "write")
  const dataJSON = JSON.stringify(data)
  await db
    .insert(pages)
    .values({ key, data: dataJSON })
    .onConflictDoUpdate({ target: pages.key, set: { data: dataJSON } })

  console.log(`Revalidating ${key}`)
  revalidatePath(key)
}

/*
 * Image actions
 */
const getAllImages: OberonAdapter["getAllImages"] = async () => {
  "use server"
  await will("images", "read")

  const allImages = await db
    .select({
      key: images.key,
      alt: images.alt,
      url: images.url,
      size: images.size,
      height: images.height,
      width: images.width,
    })
    .from(images)
    .execute()
  return allImages || []
}

const addImage: OberonAdapter["addImage"] = async (data: unknown) => {
  "use server"
  await will("images", "write")

  const image = ImageSchema.parse(data)
  await db.insert(images).values(image).execute()
  return getAllImages()
}

// TODO uploadthing
const deleteImage: OberonAdapter["deleteImage"] = async (data) => {
  "use server"
  await will("images", "write")
  console.warn("FIXME deleteImage not implemented", data)
}
/*
const deleteImage = async (data: Pick<Image, "key">) => { 
  const { key } = DeleteImageSchema.parse(data)
  try {
    await ourUploadthing.deleteFiles(key)
    await db.delete(images).where(eq(images.key, key))
    return key
  } catch (_error) {
    console.error("Delete image failed")
    return null
  }
}
*/

/*
 * User actions
 */
const getAllUsersCached = cache(
  async () => {
    const allUsers = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
    return allUsers || []
  },
  undefined,
  {
    tags: ["oberon-users"],
  },
)
const getAllUsers: OberonAdapter["getAllUsers"] = async () => {
  "use server"
  await will("users", "read")
  return getAllUsersCached()
}

const changeRole: OberonAdapter["changeRole"] = async (data: unknown) => {
  "use server"
  await will("users", "write")
  const { role, id } = ChangeRoleSchema.parse(data)
  try {
    await db.update(users).set({ role }).where(eq(users.id, id))
    revalidateTag("oberon-users")
    return { role, id }
  } catch (_error) {
    console.error("Change role failed")
    return null
  }
}

const deleteUser: OberonAdapter["deleteUser"] = async (data: unknown) => {
  "use server"
  await will("users", "write")
  const { id } = DeleteUserSchema.parse(data)
  try {
    await authAdapter.deleteUser(id)
    revalidateTag("oberon-users")
    return { id }
  } catch (_error) {
    console.error("Delete user failed")
    return null
  }
}

const addUser: OberonAdapter["addUser"] = async (data: unknown) => {
  "use server"
  await will("users", "write")
  const { email, role } = AddUserSchema.parse(data)

  try {
    const { id } = await authAdapter.createUser({
      email,
      // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
      role,
      emailVerified: null,
    })
    revalidateTag("oberon-users")
    return { id, email, role }
  } catch (_error) {
    console.error("Create user failed")
    return null
  }
}

export const adapter = {
  addUser,
  deleteUser,
  changeRole,
  getAllUsers,
  addImage,
  deleteImage,
  getAllImages,
  addPage,
  deletePage,
  getPageData,
  publishPageData,
  getAllPages,
  getAllPaths,
  can,
} satisfies OberonAdapter

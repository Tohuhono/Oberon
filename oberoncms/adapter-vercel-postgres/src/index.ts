import "server-only"

import { eq } from "drizzle-orm"
import { type OberonDatabaseAdapter } from "@oberoncms/core"

// import { ourUploadthing } from "src/puck/uploadthing/api" // TODO uploadthing
import { db } from "src/db/client"
import { images, pages, users } from "src/db/schema"

import { adapter } from "@/db/next-auth-adapter"

export const databaseAdapter: OberonDatabaseAdapter = {
  ...adapter,
  getAllUsers: async () => {
    return await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
  },
  // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
  addUser: async ({ email, role }) => {
    // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
    return await adapter.createUser({
      email,
      // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
      role,
      emailVerified: null,
    })
  },
  changeRole: async ({ role, id }) => {
    await db.update(users).set({ role }).where(eq(users.id, id))
  },
  addImage: async (image) => {
    await db.insert(images).values(image).execute()
  },
  deleteImage: async () => {},
  getAllImages: async () => {
    return await db
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
  },
  addPage: async ({ key, data }) => {
    await db.insert(pages).values({ key, data })
  },
  deletePage: async (key) => {
    await db.delete(pages).where(eq(pages.key, key))
  },
  getPageData: async (key) => {
    const result = await db
      .select({
        data: pages.data,
      })
      .from(pages)
      .where(eq(pages.key, key))

    return result[0]?.data || null
  },
  publishPageData: async ({ key, data }) => {
    await db
      .insert(pages)
      .values({ key, data })
      .onConflictDoUpdate({ target: pages.key, set: { data } })
  },
  getAllPages: async () => {
    return await db.select({ key: pages.key }).from(pages)
  },
}

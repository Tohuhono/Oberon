import "server-only"

import { eq } from "drizzle-orm"
import { type OberonDatabaseAdapter } from "@oberoncms/core"

import { db } from "./db/client"
import { images, pages, users } from "./db/schema"
import { adapter } from "./db/next-auth-adapter"

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
  deleteImage: async (key) => {
    await db.delete(images).where(eq(images.key, key))
  },
  getAllImages: async () => {
    return await db
      .select({
        key: images.key,
        alt: images.alt,
        url: images.url,
        size: images.size,
        height: images.height,
        width: images.width,
        updatedAt: images.updatedAt,
        updatedBy: images.updatedBy,
      })
      .from(images)
      .execute()
  },
  addPage: async ({ key, data, updatedAt, updatedBy }) => {
    await db.insert(pages).values({ key, data, updatedAt, updatedBy })
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
  updatePageData: async ({ key, data, updatedAt, updatedBy }) => {
    await db
      .insert(pages)
      .values({ key, data, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: pages.key,
        set: { data, updatedAt, updatedBy },
      })
  },
  getAllPages: async () => {
    return await db
      .select({
        key: pages.key,
        updatedAt: pages.updatedAt,
        updatedBy: pages.updatedBy,
      })
      .from(pages)
  },
}

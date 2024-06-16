import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { type OberonBaseAdapter, type PageData } from "@oberoncms/core"

import { images, pages, site, users } from "./schema"
import type { DatabaseClient } from "./client"

export const getDatabaseAdapter = (
  db: () => DatabaseClient,
): OberonBaseAdapter => ({
  getAllUsers: async () => {
    return await db()
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
  },
  addUser: async ({ email, role }) => {
    return db()
      .insert(users)
      .values({ email, role, id: randomUUID(), emailVerified: null })
      .returning()
      .get()
  },
  deleteUser: async (id) => {
    await db().delete(users).where(eq(users.id, id)).returning().get()
  },
  changeRole: async ({ role, id }) => {
    await db().update(users).set({ role }).where(eq(users.id, id)).execute()
  },
  getSite: async () => {
    const result = await db()
      .select({
        version: site.version,
        components: site.components,
        updatedAt: site.updatedAt,
        updatedBy: site.updatedBy,
      })
      .from(site)
      .where(eq(site.id, 1))
      .execute()
    return result[0]
  },
  updateSite: async ({ version, components, updatedAt, updatedBy }) => {
    await db()
      .insert(site)
      .values({ id: 1, version, components, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: site.id,
        set: { version, components, updatedAt, updatedBy },
      })
      .execute()
  },
  addImage: async (image) => {
    await db().insert(images).values(image).execute()
  },
  deleteImage: async (key) => {
    await db().delete(images).where(eq(images.key, key)).execute()
  },
  getAllImages: async () => {
    return await db()
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
    await db()
      .insert(pages)
      .values({ key, data, updatedAt, updatedBy })
      .execute()
  },
  deletePage: async (key) => {
    await db().delete(pages).where(eq(pages.key, key)).execute()
  },
  getPageData: async (key) => {
    const result = await db()
      .select({
        data: pages.data,
      })
      .from(pages)
      .where(eq(pages.key, key))
      .execute()

    return (result[0]?.data as PageData) || null
  },
  updatePageData: async ({ key, data, updatedAt, updatedBy }) => {
    await db()
      .insert(pages)
      .values({ key, data, updatedAt, updatedBy })
      .onConflictDoUpdate({ target: pages.key, set: { data } })
      .execute()
  },
  getAllPages: async () => {
    return await db()
      .select({
        key: pages.key,
        updatedAt: pages.updatedAt,
        updatedBy: pages.updatedBy,
      })
      .from(pages)
      .execute()
  },
})

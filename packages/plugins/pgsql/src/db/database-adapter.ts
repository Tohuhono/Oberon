import { and, eq } from "drizzle-orm"

import { JsonValueSchema, type OberonBaseAdapter } from "@oberoncms/core"
import { type DatabaseClient } from "./client"
import { images, kv, pages, site } from "./schema"

export const getDatabaseAdapter: (db: DatabaseClient) => OberonBaseAdapter = (
  db,
) => ({
  getSite: async () => {
    const result = await db
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
    await db
      .insert(site)
      .values({ id: 1, version, components, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: site.id,
        set: { version, components, updatedAt, updatedBy },
      })
      .execute()
  },
  addImage: async (image) => {
    await db.insert(images).values(image).execute()
  },
  deleteImage: async (key) => {
    await db.delete(images).where(eq(images.key, key)).execute()
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
    await db.insert(pages).values({ key, data, updatedAt, updatedBy }).execute()
  },
  deletePage: async (key) => {
    await db.delete(pages).where(eq(pages.key, key)).execute()
  },
  deleteKV: async (namespace, key) => {
    await db
      .delete(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()
  },
  getPageData: async (key) => {
    const result = await db
      .select({
        data: pages.data,
      })
      .from(pages)
      .where(eq(pages.key, key))
      .execute()

    return result[0]?.data || null
  },
  getKV: async (namespace, key) => {
    const result = await db
      .select({ value: kv.value })
      .from(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()

    const value = result[0]?.value

    return value === undefined ? null : JsonValueSchema.parse(value)
  },
  updatePageData: async ({ key, data, updatedAt, updatedBy }) => {
    await db
      .insert(pages)
      .values({ key, data, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: pages.key,
        set: { data, updatedAt, updatedBy },
      })
      .execute()
  },
  putKV: async (namespace, key, value) => {
    await db
      .insert(kv)
      .values({ namespace, key, value })
      .onConflictDoUpdate({
        target: [kv.namespace, kv.key],
        set: { value },
      })
      .execute()
  },
  getAllPages: async () => {
    return await db
      .select({
        key: pages.key,
        updatedAt: pages.updatedAt,
        updatedBy: pages.updatedBy,
      })
      .from(pages)
      .execute()
  },
})

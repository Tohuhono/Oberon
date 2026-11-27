import { randomUUID } from "crypto"

import {
  UserSchema,
  JsonValueSchema,
  ComponentRecordSchema,
  type OberonDatabaseAdapter,
} from "@oberoncms/core"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import type { DatabaseClient } from "./client"
import { user } from "./schema"
import { components, images, kv, site } from "./schema"

export const getDatabaseAdapter = (db: () => DatabaseClient): OberonDatabaseAdapter => ({
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
  updateSite: async ({ version, components: componentVersions, updatedAt, updatedBy }) => {
    await db()
      .insert(site)
      .values({ id: 1, version, components: componentVersions, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: site.id,
        set: { version, components: componentVersions, updatedAt, updatedBy },
      })
      .execute()
  },
  addImage: async (image) => {
    await db().insert(images).values(image).execute()
  },
  deleteImage: async ({ key }) => {
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
  addComponent: async ({ key, type, data, updatedAt, updatedBy }) => {
    await db().insert(components).values({ key, type, data, updatedAt, updatedBy }).execute()
  },
  deleteComponent: async ({ key, type }) => {
    await db()
      .delete(components)
      .where(and(eq(components.key, key), eq(components.type, type)))
      .execute()
  },
  deleteKV: async ({ namespace, key }) => {
    await db()
      .delete(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()
  },
  getComponent: async ({ key }) => {
    const result = await db().select().from(components).where(eq(components.key, key)).execute()

    const component = result[0] && ComponentRecordSchema.parse(result[0])

    return component ?? null
  },
  getKV: async ({ namespace, key }) => {
    const result = await db()
      .select({ value: kv.value })
      .from(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()

    const value = result[0]?.value

    return value === undefined ? null : JsonValueSchema.parse(value)
  },
  updateComponentData: async ({ key, type, data, updatedAt, updatedBy }) => {
    await db()
      .insert(components)
      .values({ key, type, data, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: components.key,
        set: { data, updatedAt, updatedBy },
      })
      .execute()
  },
  putKV: async ({ namespace, key, value }) => {
    await db()
      .insert(kv)
      .values({ namespace, key, value })
      .onConflictDoUpdate({
        target: [kv.namespace, kv.key],
        set: { value },
      })
      .execute()
  },
  listComponents: async (type) => {
    return await db()
      .select({
        key: components.key,
        type: components.type,
        updatedAt: components.updatedAt,
        updatedBy: components.updatedBy,
      })
      .from(components)
      .where(eq(components.type, type))
      .execute()
  },

  getAllUsers: async () => {
    return z
      .array(UserSchema)
      .parse(
        await db().select({ id: user.id, email: user.email, role: user.role }).from(user).execute(),
      )
  },
  addUser: async ({ email, role }) => {
    const result = await db()
      .insert(user)
      .values({ id: randomUUID(), name: email, email, role })
      .returning({ id: user.id, email: user.email, role: user.role })
      .execute()

    const createdUser = result[0]

    if (!createdUser) {
      throw new Error("Failed to create user.")
    }

    return UserSchema.parse(createdUser)
  },
  deleteUser: async ({ id }) => {
    await db().delete(user).where(eq(user.id, id)).execute()
  },
  changeRole: async ({ role, id }) => {
    await db().update(user).set({ role }).where(eq(user.id, id)).execute()
  },
})

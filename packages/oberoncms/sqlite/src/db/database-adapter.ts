import { randomUUID } from "crypto"

import {
  JsonValueSchema,
  FragmentSchema,
  ResponseError,
  type OberonDatabaseAdapter,
} from "@oberoncms/core"
import { UserSchema } from "@oberoncms/core"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import type { DatabaseClient } from "./client"
import { user } from "./schema"
import { fragments, images, kv, site } from "./schema"

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
  addFragment: async ({ key, type, data, updatedAt, updatedBy }) => {
    await db().insert(fragments).values({ key, type, data, updatedAt, updatedBy }).execute()
  },
  deleteFragment: async ({ key, type, expectedUpdatedAt }) => {
    const query = db()
      .delete(fragments)
      .where(
        and(
          eq(fragments.key, key),
          eq(fragments.type, type),
          ...(expectedUpdatedAt ? [eq(fragments.updatedAt, expectedUpdatedAt)] : []),
        ),
      )
      .returning({ key: fragments.key })
    const result = await query.execute()

    if (expectedUpdatedAt && !result.length) {
      throw new ResponseError("Fragment changed since you loaded it. Reload and try again.")
    }
  },
  deleteKV: async ({ namespace, key }) => {
    await db()
      .delete(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()
  },
  getFragmentData: async ({ key, type }) => {
    const result = await db()
      .select()
      .from(fragments)
      .where(and(eq(fragments.key, key), eq(fragments.type, type)))
      .execute()

    const fragment = result[0] && FragmentSchema.parse(result[0])

    return fragment ?? null
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
  updateFragmentData: async ({ key, type, data, updatedAt, updatedBy, expectedUpdatedAt }) => {
    if (expectedUpdatedAt) {
      const result = await db()
        .update(fragments)
        .set({ data, updatedAt, updatedBy })
        .where(
          and(
            eq(fragments.key, key),
            eq(fragments.type, type),
            eq(fragments.updatedAt, expectedUpdatedAt),
          ),
        )
        .returning({ updatedAt: fragments.updatedAt })
        .execute()

      const persisted = result[0]
      if (!persisted) {
        throw new ResponseError("Fragment changed since you loaded it. Reload and try again.")
      }

      return persisted.updatedAt
    }

    await db()
      .insert(fragments)
      .values({ key, type, data, updatedAt, updatedBy })
      .onConflictDoUpdate({
        target: fragments.key,
        set: { data, updatedAt, updatedBy },
        where: eq(fragments.type, type),
      })
      .execute()

    const fragment = await db()
      .select({ type: fragments.type, updatedAt: fragments.updatedAt })
      .from(fragments)
      .where(eq(fragments.key, key))
      .execute()

    if (fragment[0]?.type !== type) {
      throw new ResponseError("A Fragment with this key already exists with a different type.")
    }
    return fragment[0].updatedAt
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
  getAllFragments: async (type) => {
    return await db()
      .select({
        key: fragments.key,
        type: fragments.type,
        updatedAt: fragments.updatedAt,
        updatedBy: fragments.updatedBy,
      })
      .from(fragments)
      .where(eq(fragments.type, type))
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
    return UserSchema.parse(
      await db()
        .insert(user)
        .values({
          id: randomUUID(),
          name: email,
          email,
          role,
        })
        .returning()
        .get(),
    )
  },
  deleteUser: async ({ id }) => {
    await db().delete(user).where(eq(user.id, id)).returning().get()
  },
  changeRole: async ({ role, id }) => {
    await db().update(user).set({ role }).where(eq(user.id, id)).execute()
  },
})

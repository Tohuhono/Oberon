import { randomUUID } from "crypto"

import {
  FRAGMENT_REVISION,
  FragmentDataSchema,
  FragmentRevisionError,
  JsonValueSchema,
  ResponseError,
  type FragmentWriteOptions,
  type OberonDatabaseAdapter,
} from "@oberoncms/core"
import { UserSchema } from "@oberoncms/core"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import type { DatabaseClient } from "./client"
import { user } from "./schema"
import { fragments, images, kv, site } from "./schema"

async function writeFragment(
  db: () => DatabaseClient,
  expectedRevision: FragmentWriteOptions["expectedRevision"],
  write: (
    transaction: Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0],
  ) => Promise<void>,
) {
  await db().transaction(async (transaction) => {
    await transaction
      .insert(kv)
      .values({ ...FRAGMENT_REVISION, value: "" })
      .onConflictDoNothing()
      .execute()

    const [current] = await transaction
      .select({ value: kv.value })
      .from(kv)
      .where(and(eq(kv.namespace, FRAGMENT_REVISION.namespace), eq(kv.key, FRAGMENT_REVISION.key)))
      .execute()

    if (expectedRevision !== undefined && current?.value !== expectedRevision) {
      throw new FragmentRevisionError("Content changed while saving. Reload and try again.")
    }

    await write(transaction)
    await transaction
      .update(kv)
      .set({ value: randomUUID() })
      .where(and(eq(kv.namespace, FRAGMENT_REVISION.namespace), eq(kv.key, FRAGMENT_REVISION.key)))
      .execute()
  })
}

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
  addFragment: async ({ key, type, data, updatedAt, updatedBy, expectedRevision }) => {
    await writeFragment(db, expectedRevision, async (transaction) => {
      const [existing] = await transaction
        .select({ key: fragments.key })
        .from(fragments)
        .where(eq(fragments.key, key))
        .execute()
      if (existing) throw new ResponseError(`A Fragment already uses the key "${key}".`)
      await transaction
        .insert(fragments)
        .values({ key, type, data, updatedAt, updatedBy })
        .execute()
    })
  },
  deleteFragment: async ({ key, type, expectedUpdatedAt, expectedRevision }) => {
    await writeFragment(db, expectedRevision, async (transaction) => {
      const deleted = await transaction
        .delete(fragments)
        .where(
          and(
            eq(fragments.key, key),
            eq(fragments.type, type),
            expectedUpdatedAt ? eq(fragments.updatedAt, expectedUpdatedAt) : undefined,
          ),
        )
        .returning({ key: fragments.key })
        .execute()
      if (!deleted.length) {
        throw new ResponseError("The Fragment changed or no longer exists. Reload and try again.")
      }
    })
  },
  deleteKV: async ({ namespace, key }) => {
    await db()
      .delete(kv)
      .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
      .execute()
  },
  getFragmentData: async ({ key, type }) => {
    const result = await db()
      .select({
        data: fragments.data,
      })
      .from(fragments)
      .where(and(eq(fragments.key, key), type ? eq(fragments.type, type) : undefined))
      .execute()

    return result[0] ? FragmentDataSchema.parse(result[0].data) : null
  },
  getFragmentRevision: async () => {
    const [revision] = await db()
      .select({ value: kv.value })
      .from(kv)
      .where(and(eq(kv.namespace, FRAGMENT_REVISION.namespace), eq(kv.key, FRAGMENT_REVISION.key)))
      .execute()
    return z.string().parse(revision?.value ?? "")
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
  updateFragmentData: async ({
    key,
    type,
    data,
    updatedAt,
    updatedBy,
    expectedUpdatedAt,
    expectedRevision,
  }) => {
    await writeFragment(db, expectedRevision, async (transaction) => {
      const [existing] = await transaction
        .select({ type: fragments.type, updatedAt: fragments.updatedAt })
        .from(fragments)
        .where(eq(fragments.key, key))
        .execute()
      if (
        (existing && existing.type !== type) ||
        (expectedUpdatedAt && existing?.updatedAt.getTime() !== expectedUpdatedAt.getTime())
      ) {
        throw new ResponseError("The Fragment changed. Reload before publishing your changes.")
      }
      if (existing) {
        await transaction
          .update(fragments)
          .set({ data, updatedAt, updatedBy })
          .where(eq(fragments.key, key))
          .execute()
      } else {
        await transaction
          .insert(fragments)
          .values({ key, type, data, updatedAt, updatedBy })
          .execute()
      }
    })
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
  getAllFragments: async ({ type }) => {
    return await db()
      .select({
        key: fragments.key,
        type: fragments.type,
        updatedAt: fragments.updatedAt,
        updatedBy: fragments.updatedBy,
      })
      .from(fragments)
      .where(type ? eq(fragments.type, type) : undefined)
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

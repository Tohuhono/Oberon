import { randomUUID } from "crypto"
import { AsyncLocalStorage } from "node:async_hooks"

import {
  UserSchema,
  JsonValueSchema,
  FragmentSchema,
  ResponseError,
  type OberonDatabaseAdapter,
} from "@oberoncms/core"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"

import type { DatabaseClient } from "./client"
import { user } from "./schema"
import { fragments, images, kv, site } from "./schema"

const fragmentRevision = sql`date_trunc('milliseconds', ${fragments.updatedAt})`

export function getDatabaseAdapter(db: () => DatabaseClient): OberonDatabaseAdapter {
  const transaction = new AsyncLocalStorage<
    Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0]
  >()
  const fragmentsDb = () => transaction.getStore() ?? db()
  return {
    withFragmentTransaction: (write) =>
      db().transaction(async (tx) => {
        await tx.execute(sql`LOCK TABLE ${fragments} IN SHARE ROW EXCLUSIVE MODE`)
        return transaction.run(tx, write)
      }),
    getSite: async () => {
      const result = await fragmentsDb()
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
      await fragmentsDb()
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
      await fragmentsDb()
        .insert(fragments)
        .values({ key, type, data, updatedAt, updatedBy })
        .execute()
    },
    deleteFragment: async ({ key, type, expectedUpdatedAt }) => {
      const result = await fragmentsDb()
        .delete(fragments)
        .where(
          and(
            eq(fragments.key, key),
            eq(fragments.type, type),
            ...(expectedUpdatedAt
              ? [eq(fragmentRevision, sql`${expectedUpdatedAt.toISOString()}::timestamp`)]
              : []),
          ),
        )
        .returning({ updatedAt: fragments.updatedAt })
        .execute()

      if (expectedUpdatedAt && !result.length) {
        throw new ResponseError("Fragment changed since you loaded it. Reload and try again.")
      }
    },
    deleteKV: async ({ namespace, key }) => {
      await fragmentsDb()
        .delete(kv)
        .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
        .execute()
    },
    getFragmentData: async ({ key }) => {
      const result = await fragmentsDb()
        .select()
        .from(fragments)
        .where(eq(fragments.key, key))
        .execute()

      const fragment = result[0] && FragmentSchema.parse(result[0])

      return fragment ?? null
    },
    getKV: async ({ namespace, key }) => {
      const result = await fragmentsDb()
        .select({ value: kv.value })
        .from(kv)
        .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
        .execute()

      const value = result[0]?.value

      return value === undefined ? null : JsonValueSchema.parse(value)
    },
    updateFragmentData: async ({ key, type, data, updatedAt, updatedBy, expectedUpdatedAt }) => {
      const changes = {
        data,
        updatedAt: sql`greatest(${updatedAt.toISOString()}::timestamp, date_trunc('milliseconds', ${fragments.updatedAt}) + interval '1 millisecond')`,
        updatedBy,
      }
      const condition = and(eq(fragments.key, key), eq(fragments.type, type))
      const returning = { updatedAt: fragments.updatedAt }
      const [persisted] = expectedUpdatedAt
        ? await fragmentsDb()
            .update(fragments)
            .set(changes)
            .where(
              and(
                condition,
                eq(fragmentRevision, sql`${expectedUpdatedAt.toISOString()}::timestamp`),
              ),
            )
            .returning(returning)
            .execute()
        : await fragmentsDb()
            .insert(fragments)
            .values({ key, type, data, updatedAt, updatedBy })
            .onConflictDoUpdate({
              target: fragments.key,
              set: changes,
              where: eq(fragments.type, type),
            })
            .returning(returning)
            .execute()

      if (!persisted) {
        throw new ResponseError(
          expectedUpdatedAt
            ? "Fragment changed since you loaded it. Reload and try again."
            : "A Fragment with this key already exists with a different type.",
        )
      }
      return persisted.updatedAt
    },
    putKV: async ({ namespace, key, value }) => {
      await fragmentsDb()
        .insert(kv)
        .values({ namespace, key, value })
        .onConflictDoUpdate({
          target: [kv.namespace, kv.key],
          set: { value },
        })
        .execute()
    },
    getAllFragments: async (type) => {
      return await fragmentsDb()
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
          await db()
            .select({ id: user.id, email: user.email, role: user.role })
            .from(user)
            .execute(),
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
  }
}

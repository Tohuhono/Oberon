import { randomUUID } from "crypto"
import { AsyncLocalStorage } from "node:async_hooks"

import {
  UserSchema,
  JsonValueSchema,
  ComponentRecordSchema,
  ResponseError,
  type OberonDatabaseAdapter,
} from "@oberoncms/core"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"

import type { DatabaseClient } from "./client"
import { user } from "./schema"
import { components, images, kv, site } from "./schema"

const componentRevision = sql`date_trunc('milliseconds', ${components.updatedAt})`

export function getDatabaseAdapter(db: () => DatabaseClient): OberonDatabaseAdapter {
  const transaction = new AsyncLocalStorage<
    Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0]
  >()
  const componentsDb = () => transaction.getStore() ?? db()
  return {
    withComponentTransaction: (write) =>
      db().transaction(async (tx) => {
        await tx.execute(sql`LOCK TABLE ${components} IN SHARE ROW EXCLUSIVE MODE`)
        return transaction.run(tx, write)
      }),
    getSite: async () => {
      const result = await componentsDb()
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
      await componentsDb()
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
      await componentsDb()
        .insert(components)
        .values({ key, type, data, updatedAt, updatedBy })
        .execute()
    },
    deleteComponent: async ({ key, type, expectedUpdatedAt }) => {
      const result = await componentsDb()
        .delete(components)
        .where(
          and(
            eq(components.key, key),
            eq(components.type, type),
            ...(expectedUpdatedAt
              ? [eq(componentRevision, sql`${expectedUpdatedAt.toISOString()}::timestamp`)]
              : []),
          ),
        )
        .returning({ updatedAt: components.updatedAt })
        .execute()

      if (expectedUpdatedAt && !result.length) {
        throw new ResponseError("Component changed since you loaded it. Reload and try again.")
      }
    },
    deleteKV: async ({ namespace, key }) => {
      await componentsDb()
        .delete(kv)
        .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
        .execute()
    },
    getComponent: async ({ key }) => {
      const result = await componentsDb()
        .select()
        .from(components)
        .where(eq(components.key, key))
        .execute()

      const component = result[0] && ComponentRecordSchema.parse(result[0])

      return component ?? null
    },
    getKV: async ({ namespace, key }) => {
      const result = await componentsDb()
        .select({ value: kv.value })
        .from(kv)
        .where(and(eq(kv.namespace, namespace), eq(kv.key, key)))
        .execute()

      const value = result[0]?.value

      return value === undefined ? null : JsonValueSchema.parse(value)
    },
    updateComponentData: async ({ key, type, data, updatedAt, updatedBy, expectedUpdatedAt }) => {
      const changes = {
        data,
        updatedAt: sql`greatest(${updatedAt.toISOString()}::timestamp, date_trunc('milliseconds', ${components.updatedAt}) + interval '1 millisecond')`,
        updatedBy,
      }
      const condition = and(eq(components.key, key), eq(components.type, type))
      const returning = { updatedAt: components.updatedAt }
      const [persisted] = expectedUpdatedAt
        ? await componentsDb()
            .update(components)
            .set(changes)
            .where(
              and(
                condition,
                eq(componentRevision, sql`${expectedUpdatedAt.toISOString()}::timestamp`),
              ),
            )
            .returning(returning)
            .execute()
        : await componentsDb()
            .insert(components)
            .values({ key, type, data, updatedAt, updatedBy })
            .onConflictDoUpdate({
              target: components.key,
              set: changes,
              where: eq(components.type, type),
            })
            .returning(returning)
            .execute()

      if (!persisted) {
        throw new ResponseError(
          expectedUpdatedAt
            ? "Component changed since you loaded it. Reload and try again."
            : "A Component with this key already exists with a different type.",
        )
      }
      return persisted.updatedAt
    },
    putKV: async ({ namespace, key, value }) => {
      await componentsDb()
        .insert(kv)
        .values({ namespace, key, value })
        .onConflictDoUpdate({
          target: [kv.namespace, kv.key],
          set: { value },
        })
        .execute()
    },
    listComponents: async (type) => {
      return await componentsDb()
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

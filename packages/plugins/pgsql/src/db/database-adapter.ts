import { eq } from "drizzle-orm"

import {
  type OberonBaseAdapter,
  type OberonPageUpdate,
  type OberonTailwindUpdate,
} from "@oberoncms/core"
import { ResponseError } from "@oberoncms/core/errors"

import { type DatabaseClient } from "./client"
import { images, pages, site, tailwindAssets, users } from "./schema"
import { getAuthAdapter } from "./auth-adapter"

export const getDatabaseAdapter: (db: DatabaseClient) => OberonBaseAdapter = (
  db,
) => ({
  getActiveTailwindHash: async () => {
    const result = await db
      .select({ activeTailwindHash: site.activeTailwindHash })
      .from(site)
      .where(eq(site.id, 1))
      .execute()

    return result[0]?.activeTailwindHash ?? null
  },
  getSite: async () => {
    const result = await db
      .select({
        version: site.version,
        components: site.components,
        activeTailwindHash: site.activeTailwindHash,
        updatedAt: site.updatedAt,
        updatedBy: site.updatedBy,
      })
      .from(site)
      .where(eq(site.id, 1))
      .execute()
    return result[0]
  },
  updateSite: async ({
    version,
    components,
    activeTailwindHash,
    updatedAt,
    updatedBy,
  }) => {
    await db
      .insert(site)
      .values({
        id: 1,
        version,
        components,
        activeTailwindHash: activeTailwindHash ?? null,
        updatedAt,
        updatedBy,
      })
      .onConflictDoUpdate({
        target: site.id,
        set: {
          version,
          components,
          ...(activeTailwindHash === undefined ? {} : { activeTailwindHash }),
          updatedAt,
          updatedBy,
        },
      })
      .execute()
  },
  getTailwindAsset: async (hash) => {
    const result = await db
      .select({
        hash: tailwindAssets.hash,
        classList: tailwindAssets.classList,
        css: tailwindAssets.css,
      })
      .from(tailwindAssets)
      .where(eq(tailwindAssets.hash, hash))
      .execute()

    return result[0] ?? null
  },
  updateTailwind: async ({
    activeTailwindHash,
    baselineActiveTailwindHash,
    tailwindAsset,
    updatedAt,
    updatedBy,
  }: OberonTailwindUpdate) => {
    await db.transaction(async (tx) => {
      const currentSite = await tx
        .select({ activeTailwindHash: site.activeTailwindHash })
        .from(site)
        .where(eq(site.id, 1))
        .execute()

      if (
        baselineActiveTailwindHash !== undefined &&
        currentSite[0]?.activeTailwindHash !== baselineActiveTailwindHash
      ) {
        throw new ResponseError(
          "Tailwind asset state changed while publishing. Please retry.",
        )
      }

      await tx
        .insert(tailwindAssets)
        .values(tailwindAsset)
        .onConflictDoNothing()
        .execute()

      await tx
        .update(site)
        .set({ activeTailwindHash, updatedAt, updatedBy })
        .where(eq(site.id, 1))
        .execute()
    })
  },
  getAllUsers: async () => {
    return await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
  },
  addUser: async ({ email, role }) => {
    return await getAuthAdapter(db).createUser({
      email,
      role,
      emailVerified: null,
    })
  },
  deleteUser: async (id) => {
    await getAuthAdapter(db).deleteUser?.(id)
  },
  changeRole: async ({ role, id }) => {
    await db.update(users).set({ role }).where(eq(users.id, id)).execute()
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
  updatePageData: async ({
    activeTailwindHash,
    baselineActiveTailwindHash,
    key,
    data,
    tailwindAsset,
    updatedAt,
    updatedBy,
  }: OberonPageUpdate) => {
    await db.transaction(async (tx) => {
      await tx
        .insert(pages)
        .values({ key, data, updatedAt, updatedBy })
        .onConflictDoUpdate({
          target: pages.key,
          set: { data, updatedAt, updatedBy },
        })
        .execute()

      if (activeTailwindHash === undefined) {
        return
      }

      const currentSite = await tx
        .select({ activeTailwindHash: site.activeTailwindHash })
        .from(site)
        .where(eq(site.id, 1))
        .execute()

      if (
        baselineActiveTailwindHash !== undefined &&
        currentSite[0]?.activeTailwindHash !== baselineActiveTailwindHash
      ) {
        throw new ResponseError(
          "Tailwind asset state changed while publishing. Please retry.",
        )
      }

      if (tailwindAsset) {
        await tx
          .insert(tailwindAssets)
          .values(tailwindAsset)
          .onConflictDoNothing()
          .execute()
      }

      await tx
        .update(site)
        .set({ activeTailwindHash, updatedAt, updatedBy })
        .where(eq(site.id, 1))
        .execute()
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
      .execute()
  },
})

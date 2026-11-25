import { rm } from "fs/promises"
import { resolve } from "path"

import { expect, test, fromPartial, vi } from "@dev/vitest"
import { INITIAL_DATA, type OberonPluginAdapter } from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { createAdapterTest, createAdapterTests } from "@oberoncms/testing"
import { eq } from "drizzle-orm"

const rootDirectory = resolve(import.meta.dirname, "../../../../")

async function closeDevelopmentClient() {
  const client = Reflect.get(globalThis, "oberonDb")

  if (
    client &&
    typeof client === "object" &&
    "close" in client &&
    typeof client.close === "function"
  ) {
    client.close()
  }

  Reflect.deleteProperty(globalThis, "oberonDb")
}

const sqliteDirectory = resolve(rootDirectory, ".tmp/development-plugin-unit-tests")
const sqliteFile = resolve(sqliteDirectory, "oberon.db")
const sqliteUrl = `file:${sqliteFile}`

async function getDevelopmentAdapter(
  onCleanup: (callback: () => Promise<void>) => void,
): Promise<OberonPluginAdapter> {
  vi.stubEnv("USE_DEVELOPMENT_SEND", "true")
  vi.stubEnv("USE_DEVELOPMENT_DATABASE", "true")
  vi.stubEnv("SQLITE_FILE", sqliteUrl)

  await rm(sqliteDirectory, { recursive: true, force: true })
  await closeDevelopmentClient()

  vi.resetModules()

  const { plugin } = await import("./index")

  const developmentPlugin = plugin({ getAdapter: () => fromPartial({}), phase: "bootstrap" })

  await developmentPlugin.bootstrap?.()

  onCleanup(async () => {
    delete process.env.SQLITE_FILE
    delete process.env.USE_DEVELOPMENT_DATABASE
    delete process.env.USE_DEVELOPMENT_SEND
    await closeDevelopmentClient()
    await rm(sqliteDirectory, { recursive: true, force: true })
  })

  return fromPartial(getAdapter((await import("./db/client")).getClient))
}

createAdapterTests({
  description: "development plugin",
  test,
  getAdapter: getDevelopmentAdapter,
})

const developmentAdapterTest = createAdapterTest(test).extend(
  "adapter",
  { scope: "worker" },
  // oxlint-disable-next-line no-empty-pattern
  async ({}, { onCleanup }) => getDevelopmentAdapter(onCleanup),
)

developmentAdapterTest.describe(
  "development plugin auth adapter",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
    developmentAdapterTest("persists and manages the core user lifecycle", async ({ adapter }) => {
      if (!adapter.addUser || !adapter.getAllUsers || !adapter.changeRole || !adapter.deleteUser) {
        throw new Error("Development plugin adapter is missing user lifecycle methods")
      }

      const added = await adapter.addUser({
        email: "phase5-user@example.com",
        role: "user",
      })

      expect(added.email).toBe("phase5-user@example.com")
      expect(added.role).toBe("user")

      await expect(adapter.getAllUsers()).resolves.toEqual([
        {
          id: added.id,
          email: "phase5-user@example.com",
          role: "user",
        },
      ])

      await adapter.changeRole({ id: added.id, role: "admin" })

      await expect(adapter.getAllUsers()).resolves.toEqual([
        {
          id: added.id,
          email: "phase5-user@example.com",
          role: "admin",
        },
      ])

      await adapter.deleteUser({ id: added.id })

      await expect(adapter.getAllUsers()).resolves.toEqual([])
    })

    developmentAdapterTest(
      "keeps page updatedBy as a write-time snapshot after auth user changes",
      async ({ adapter }) => {
        if (!adapter.addUser || !adapter.addFragment || !adapter.getAllFragments) {
          throw new Error("Development plugin adapter is missing page or user methods")
        }

        const added = await adapter.addUser({
          email: "snapshot@example.com",
          role: "admin",
        })

        await adapter.addFragment({
          key: "/write-time-snapshot",
          type: "page",
          data: INITIAL_DATA,
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedBy: added.email,
        })

        const readUpdatedBy = async () => {
          const pages = await adapter.getAllFragments("page")

          return pages.find((page) => page.key === "/write-time-snapshot")?.updatedBy
        }

        expect(await readUpdatedBy()).toBe("snapshot@example.com")

        const { getClient } = await import("./db/client")
        const { user } = await import("./db/schema")

        await getClient()
          .update(user)
          .set({
            email: "renamed@example.com",
            name: "renamed@example.com",
          })
          .where(eq(user.id, added.id))
          .execute()

        expect(await readUpdatedBy()).toBe("snapshot@example.com")

        await adapter.deleteUser?.({ id: added.id })

        expect(await readUpdatedBy()).toBe("snapshot@example.com")
      },
    )
  },
)

developmentAdapterTest.describe(
  "Fragment writes",
  { tags: ["ai", "feature-shared-components"] },
  () => {
    developmentAdapterTest(
      "serializes publishing a reference with deleting its source",
      async ({ adapter: storage }) => {
        const { initAdapter } = await import("@oberoncms/core/adapter")
        const adapter = initAdapter({
          client: fromPartial({ version: 1, components: {} }),
          plugins: [
            () => ({
              name: "fragment-storage",
              adapter: {
                addFragment: () => storage.addFragment,
                deleteFragment: () => storage.deleteFragment,
                getAllFragments: () => storage.getAllFragments,
                getFragmentData: () => storage.getFragmentData,
                withFragmentTransaction: () => storage.withFragmentTransaction,
              },
            }),
          ],
        })
        const key = "transaction-source"
        const updatedAt = new Date()
        const updatedBy = "test@example.com"

        await adapter.addFragment({
          key,
          type: "shared",
          data: { name: "Source", tree: INITIAL_DATA, exposures: [], defaults: {} },
          updatedAt,
          updatedBy,
        })

        const [publication, deletion] = await Promise.allSettled([
          adapter.addFragment({
            key: "/transaction-page",
            type: "page",
            data: {
              ...INITIAL_DATA,
              content: [
                { type: "SharedComponent", props: { id: "instance", sharedComponentKey: key } },
              ],
            },
            updatedAt,
            updatedBy,
          }),
          adapter.deleteFragment({ key, type: "shared" }),
        ])

        expect(publication.status).toBe("fulfilled")
        expect(deletion).toMatchObject({
          status: "rejected",
          reason: { message: expect.stringContaining("/transaction-page") },
        })
        await expect(adapter.getFragmentData({ key })).resolves.toMatchObject({ type: "shared" })
      },
    )
  },
)

developmentAdapterTest.describe(
  "Component migrations",
  { tags: ["ai", "feature-shared-components"] },
  () => {
    developmentAdapterTest(
      "rolls back a Page update when a Shared transform fails",
      async ({ adapter: storage }) => {
        const { initAdapter } = await import("@oberoncms/core/adapter")
        const updatedAt = new Date()
        const user = { id: "editor", email: "editor@example.com", role: "admin" as const }
        const page = "/migration-page"
        const shared = "migration-shared"
        const publication = { updatedAt, updatedBy: user.email }
        let failShared = true

        const adapter = initAdapter({
          client: fromPartial({
            version: 1,
            components: {
              Text: {
                transforms: [
                  (props: Record<string, unknown>) => {
                    if (props.text === "shared" && failShared)
                      throw new Error("Shared transform failed")
                    return { ...props, text: String(props.text) + " migrated" }
                  },
                ],
              },
            },
          }),
          plugins: [
            () => ({
              name: "fragment-storage",
              adapter: {
                getAllFragments: () => storage.getAllFragments,
                getFragmentData: () => storage.getFragmentData,
                getSite: () => storage.getSite,
                updateFragmentData: () => storage.updateFragmentData,
                updateSite: () => storage.updateSite,
                withFragmentTransaction: () => storage.withFragmentTransaction,
              },
            }),
          ],
        })

        await storage.updateSite({ ...publication, version: 1, components: { Text: 0 } })
        await storage.addFragment({
          ...publication,
          key: page,
          type: "page",
          data: {
            ...INITIAL_DATA,
            content: [{ type: "Text", props: { id: "page-text", text: "page" } }],
          },
        })
        await storage.addFragment({
          ...publication,
          key: shared,
          type: "shared",
          data: {
            name: "Shared",
            tree: {
              ...INITIAL_DATA,
              content: [{ type: "Text", props: { id: "shared-text", text: "shared" } }],
            },
            exposures: [],
            defaults: {},
          },
        })

        const migrate = async () => {
          let chunk = await adapter.migrateData(user)
          while (chunk.next && chunk.iteratorResult.value?.type !== "summary")
            chunk = await chunk.next
          return chunk.iteratorResult.value
        }

        await expect(migrate()).resolves.toMatchObject({
          error: expect.arrayContaining([page, shared]),
        })
        await expect(storage.getSite()).resolves.toMatchObject({ components: { Text: 0 } })
        await expect(storage.getFragmentData({ key: page })).resolves.toMatchObject({
          data: { content: [{ props: { text: "page" } }] },
        })

        failShared = false
        await expect(migrate()).resolves.toMatchObject({
          error: [],
          success: expect.arrayContaining([page, shared]),
        })
        await expect(storage.getSite()).resolves.toMatchObject({ components: { Text: 1 } })
        await expect(storage.getFragmentData({ key: page })).resolves.toMatchObject({
          data: { content: [{ props: { text: "page migrated" } }] },
        })
        await expect(storage.getFragmentData({ key: shared })).resolves.toMatchObject({
          data: { tree: { content: [{ props: { text: "shared migrated" } }] } },
        })
      },
    )
  },
)

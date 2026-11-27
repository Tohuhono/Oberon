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

  const developmentPlugin = plugin({
    getAdapter: () => fromPartial({}),
    phase: "bootstrap",
  })

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
        if (!adapter.addUser || !adapter.addComponent || !adapter.listComponents) {
          throw new Error("Development plugin adapter is missing page or user methods")
        }

        const added = await adapter.addUser({
          email: "snapshot@example.com",
          role: "admin",
        })

        await adapter.addComponent({
          key: "/write-time-snapshot",
          type: "page",
          data: INITIAL_DATA,
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedBy: added.email,
        })

        const readUpdatedBy = async () => {
          const pages = await adapter.listComponents("page")

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
  "Component writes",
  { tags: ["ai", "feature-component-storage"] },
  () => {
    developmentAdapterTest(
      "rolls back the Component and derived data when a publication effect fails",
      async ({ adapter: storage }) => {
        const { initAdapter } = await import("@oberoncms/core/adapter")
        const key = "/failed-publication"
        const effect = { namespace: "publication-test", key }
        const adapter = initAdapter({
          client: fromPartial({ version: 1, components: {} }),
          plugins: [
            ({ getAdapter: getRuntimeAdapter }) => ({
              name: "component-storage",
              adapter: {
                addComponent: () => storage.addComponent,
                getComponent: () => storage.getComponent,
                withComponentTransaction: () => storage.withComponentTransaction,
                getKV: () => storage.getKV,
                putKV: () => storage.putKV,
                onComponentWrite: () => async () => {
                  const runtimeAdapter = getRuntimeAdapter()
                  expect(await runtimeAdapter.getComponent({ key })).toMatchObject({ key })
                  await runtimeAdapter.putKV({ ...effect, value: "derived asset" })
                  throw new Error("Publication effect failed")
                },
              },
            }),
          ],
        })

        await expect(
          adapter.addComponent({
            key,
            type: "page",
            data: INITIAL_DATA,
            updatedAt: new Date(),
            updatedBy: "test@example.com",
          }),
        ).rejects.toThrow("Publication effect failed")
        await expect(adapter.getComponent({ key })).resolves.toBeNull()
        await expect(adapter.getKV(effect)).resolves.toBeNull()
      },
    )
  },
)

developmentAdapterTest.describe(
  "Component migrations",
  { tags: ["ai", "feature-component-storage"] },
  () => {
    developmentAdapterTest(
      "rolls back all Page updates when a transform fails",
      async ({ adapter: storage }) => {
        const { initAdapter } = await import("@oberoncms/core/adapter")
        const updatedAt = new Date()
        const user = { id: "editor", email: "editor@example.com", role: "admin" as const }
        const page = "/migration-page"
        const secondPage = "/migration-second-page"
        const publication = { updatedAt, updatedBy: user.email }
        let failSecond = true

        const adapter = initAdapter({
          client: fromPartial({
            version: 1,
            components: {
              Text: {
                transforms: [
                  (props: Record<string, unknown>) => {
                    if (props.text === "second" && failSecond)
                      throw new Error("Second transform failed")
                    return { ...props, text: String(props.text) + " migrated" }
                  },
                ],
              },
            },
          }),
          plugins: [
            () => ({
              name: "component-storage",
              adapter: {
                listComponents: () => storage.listComponents,
                getComponent: () => storage.getComponent,
                getSite: () => storage.getSite,
                updateComponentData: () => storage.updateComponentData,
                updateSite: () => storage.updateSite,
                withComponentTransaction: () => storage.withComponentTransaction,
              },
            }),
          ],
        })

        await storage.updateSite({ ...publication, version: 1, components: { Text: 0 } })
        await storage.addComponent({
          ...publication,
          key: page,
          type: "page",
          data: {
            ...INITIAL_DATA,
            content: [{ type: "Text", props: { id: "page-text", text: "page" } }],
          },
        })
        await storage.addComponent({
          ...publication,
          key: secondPage,
          type: "page",
          data: {
            ...INITIAL_DATA,
            content: [{ type: "Text", props: { id: "second-text", text: "second" } }],
          },
        })

        const migrate = async () => {
          let chunk = await adapter.migrateData(user)
          while (chunk.next && chunk.iteratorResult.value?.type !== "summary")
            chunk = await chunk.next
          return chunk.iteratorResult.value
        }

        await expect(migrate()).resolves.toMatchObject({
          error: expect.arrayContaining([page, secondPage]),
        })
        await expect(storage.getSite()).resolves.toMatchObject({ components: { Text: 0 } })
        await expect(storage.getComponent({ key: page })).resolves.toMatchObject({
          data: { content: [{ props: { text: "page" } }] },
        })

        failSecond = false
        await expect(migrate()).resolves.toMatchObject({
          error: [],
          success: expect.arrayContaining([page, secondPage]),
        })
        await expect(storage.getSite()).resolves.toMatchObject({ components: { Text: 1 } })
        await expect(storage.getComponent({ key: page })).resolves.toMatchObject({
          data: { content: [{ props: { text: "page migrated" } }] },
        })
        await expect(storage.getComponent({ key: secondPage })).resolves.toMatchObject({
          data: { content: [{ props: { text: "second migrated" } }] },
        })
      },
    )
  },
)

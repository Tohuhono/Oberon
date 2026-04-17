import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { expect, test, fromPartial, vi } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { createAdapterTest, createAdapterTests } from "@oberoncms/testing"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../",
)

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

const sqliteFile = resolve(
  rootDirectory,
  ".tmp/development-plugin-unit-tests.db",
)
const sqliteUrl = `file:${sqliteFile}`

async function getDevelopmentAdapter(
  onCleanup: (callback: () => Promise<void>) => void,
): Promise<OberonPluginAdapter> {
  vi.stubEnv("USE_DEVELOPMENT_SEND", "true")
  vi.stubEnv("USE_DEVELOPMENT_DATABASE", "true")
  vi.stubEnv("SQLITE_FILE", sqliteUrl)

  await mkdir(dirname(sqliteFile), { recursive: true })
  await rm(sqliteFile, { force: true })
  await closeDevelopmentClient()

  vi.resetModules()

  const { plugin } = await import("./index")

  const adapter = plugin(fromPartial({ prebuild: () => {} })).adapter ?? {}

  await adapter.prebuild?.()

  onCleanup(async () => {
    delete process.env.SQLITE_FILE
    delete process.env.USE_DEVELOPMENT_DATABASE
    delete process.env.USE_DEVELOPMENT_SEND
    await closeDevelopmentClient()
    await rm(sqliteFile, { force: true })
  })

  return fromPartial(adapter)
}

createAdapterTests({
  description: "development plugin",
  test,
  getAdapter: getDevelopmentAdapter,
})

const developmentAdapterTest = createAdapterTest(test).extend(
  "adapter",
  { scope: "worker" },
  // eslint-disable-next-line no-empty-pattern
  async ({}, { onCleanup }) => getDevelopmentAdapter(onCleanup),
)

developmentAdapterTest.describe(
  "development plugin auth adapter",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
    developmentAdapterTest(
      "persists and manages the core user lifecycle",
      async ({ adapter }) => {
        if (
          !adapter.addUser ||
          !adapter.getAllUsers ||
          !adapter.changeRole ||
          !adapter.deleteUser
        ) {
          throw new Error(
            "Development plugin adapter is missing user lifecycle methods",
          )
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

        await adapter.deleteUser(added.id)

        await expect(adapter.getAllUsers()).resolves.toEqual([])
      },
    )
  },
)

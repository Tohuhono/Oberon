import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { test, fromPartial, vi } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { createAdapterTests } from "@oberoncms/testing"

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

createAdapterTests({
  description: "development plugin",
  test,
  getAdapter: async (onCleanup): Promise<OberonPluginAdapter> => {
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
  },
})

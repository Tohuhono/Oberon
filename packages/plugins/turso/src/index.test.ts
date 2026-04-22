import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { createClient, type Client } from "@libsql/client"
import { fromPartial, test, vi } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { createAdapterTests } from "@oberoncms/testing"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./db/schema"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

const sqliteFile = resolve(rootDirectory, ".tmp/turso-plugin-unit-tests.db")

async function getTursoAdapter(
  onCleanup: (callback: () => Promise<void>) => void,
): Promise<OberonPluginAdapter> {
  await mkdir(dirname(sqliteFile), { recursive: true })
  await rm(sqliteFile, { force: true })

  vi.resetModules()

  const client: Client = createClient({ url: `file:${sqliteFile}` })
  const db = drizzle(client, { schema })

  vi.doMock("./db/client", () => ({
    getClient: () => db,
  }))

  const { plugin } = await import("./index")

  const adapter =
    plugin(fromPartial({ prebuild: async () => {} })).adapter ?? {}

  await adapter.prebuild?.()

  onCleanup(async () => {
    vi.doUnmock("./db/client")
    await client.close()
    await rm(sqliteFile, { force: true })
  })

  return fromPartial(adapter)
}

createAdapterTests({
  description: "turso plugin",
  test,
  getAdapter: getTursoAdapter,
})

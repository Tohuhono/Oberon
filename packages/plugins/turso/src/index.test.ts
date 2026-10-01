import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { fromPartial, test, vi } from "@dev/vitest"
import { createClient, type Client } from "@libsql/client"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { createAdapterTests } from "@oberoncms/testing"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./db/schema"

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")

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

  const tursoPlugin = plugin({ getAdapter: () => fromPartial({}), phase: "bootstrap" })

  await tursoPlugin.bootstrap?.()

  onCleanup(async () => {
    vi.doUnmock("./db/client")
    await client.close()
    await rm(sqliteFile, { force: true })
  })

  return fromPartial(getAdapter(() => db))
}

createAdapterTests({
  description: "turso plugin",
  test,
  getAdapter: getTursoAdapter,
})

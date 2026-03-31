import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@libsql/client"
import { fromPartial, test } from "@dev/vitest"
import { createAdapterTests } from "@oberoncms/testing"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./db/schema"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./db/migrations",
)

const sqliteFile = resolve(rootDirectory, ".tmp/turso-plugin-unit-tests.db")

createAdapterTests({
  description: "turso plugin",
  test,
  getAdapter: async (onCleanup) => {
    await mkdir(dirname(sqliteFile), { recursive: true })
    await rm(sqliteFile, { force: true })

    const client = createClient({ url: `file:${sqliteFile}` })
    const db = drizzle(client, { schema })

    await migrate(db, { migrationsFolder })

    onCleanup(async () => {
      await client.close()
      await rm(sqliteFile, { force: true })
    })

    const adapter = getAdapter(() => db)

    return fromPartial({
      prebuild: async () => {},
      getKV: adapter.getKV,
      putKV: adapter.putKV,
      deleteKV: adapter.deleteKV,
    })
  },
})

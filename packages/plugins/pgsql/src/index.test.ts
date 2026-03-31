import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import { fromPartial, test } from "@dev/vitest"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import pg from "pg"
import { createAdapterTests } from "@oberoncms/testing"
import { getDatabaseAdapter } from "./db/database-adapter"
import * as schema from "./db/schema"

const { Pool } = pg

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./db/migrations",
)
const socketDirectory = resolve(rootDirectory, ".tmp/pgsql-plugin-unit-tests")
const socketPath = resolve(socketDirectory, ".s.PGSQL.5432")

createAdapterTests({
  description: "pgsql plugin",
  test,
  getAdapter: async (onCleanup) => {
    await mkdir(socketDirectory, { recursive: true })
    await rm(socketPath, { force: true })

    const client = new PGlite()
    const server = new PGLiteSocketServer({ db: client, path: socketPath })

    await server.start()

    const pool = new Pool({
      host: socketDirectory,
      port: 5432,
      database: "postgres",
      user: "postgres",
      password: "postgres",
      ssl: false,
    })
    const db = drizzle(pool, { schema })

    await migrate(db, { migrationsFolder })

    onCleanup(async () => {
      await pool.end()
      await server.stop()
      await client.close()
      await rm(socketDirectory, { recursive: true, force: true })
    })

    const adapter = getDatabaseAdapter(db)

    return fromPartial({
      prebuild: async () => {},
      getKV: adapter.getKV,
      putKV: adapter.putKV,
      deleteKV: adapter.deleteKV,
    })
  },
})

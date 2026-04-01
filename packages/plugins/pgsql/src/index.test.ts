import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import { fromPartial, test as baseTest } from "@dev/vitest"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"
import { describeAdapterTests } from "@oberoncms/testing"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { getDatabaseAdapter } from "./db/database-adapter"
import * as schema from "./db/schema"

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./db/migrations",
)

;(async () => {
  const client = new PGlite()
  const server = new PGLiteSocketServer({ db: client })

  await server.start()

  const pool = new Pool()
  const db = drizzle(pool, { schema })

  await migrate(db, { migrationsFolder })

  const test = baseTest.extend(
    "adapter",
    { scope: "worker" },
    // eslint-disable-next-line no-empty-pattern
    async ({}, { onCleanup }): Promise<OberonPluginAdapter> => {
      onCleanup(async () => {
        await pool.end()
        await server.stop()
        await client.close()
      })

      return fromPartial(getDatabaseAdapter(db))
    },
  )

  describeAdapterTests({ description: "pgsql plugin", test })
})()

import { resolve } from "path"

import { fromPartial, test } from "@dev/vitest"
import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import { createAdapterTests } from "@oberoncms/testing"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

import { getDatabaseAdapter } from "./db/database-adapter"

const migrationsFolder = resolve(import.meta.dirname, "./db/migrations")

createAdapterTests({
  description: "pgsql plugin",
  test,
  getAdapter: async (onCleanup) => {
    const client = new PGlite()
    const server = new PGLiteSocketServer({ db: client, port: 0 })
    let pool: Pool | undefined

    const cleanup = async () => {
      await pool?.end()
      await server.stop()
      await client.close()
    }

    try {
      await server.start()
      pool = new Pool({
        connectionString: `postgresql://postgres@${server.getServerConn()}/postgres`,
      })
      const db = drizzle({ client: pool })
      await migrate(db, { migrationsFolder })

      onCleanup(cleanup)
      return fromPartial(getDatabaseAdapter(() => db))
    } catch (error) {
      await cleanup()
      throw error
    }
  },
})

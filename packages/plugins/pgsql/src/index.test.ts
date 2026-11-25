import { resolve } from "path"

import { fromPartial, test } from "@dev/vitest"
import { PGlite } from "@electric-sql/pglite"
import { createAdapterTests } from "@oberoncms/testing"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"

import { getDatabaseAdapter } from "./db/database-adapter"

const migrationsFolder = resolve(import.meta.dirname, "./db/migrations")

createAdapterTests({
  description: "pgsql plugin",
  test,
  getAdapter: async (onCleanup) => {
    const client = new PGlite()
    onCleanup(() => client.close())

    const db = drizzle({ client })
    await migrate(db, { migrationsFolder })
    return fromPartial(getDatabaseAdapter(() => db))
  },
})

import { mkdir, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "@dev/vitest"
import { createClient } from "@libsql/client"
import { INITIAL_DATA } from "@oberoncms/core"
import { getAdapter } from "@oberoncms/sqlite/adapter"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"

import * as schema from "./schema"

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "./migrations")
const sqliteFile = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../.tmp/fragment-migrations.test.db",
)

describe("Fragment schema migration", { tags: ["ai", "feature-shared-components"] }, () => {
  it("preserves existing Page keys, Puck data, authors, and timestamps", async () => {
    await mkdir(dirname(sqliteFile), { recursive: true })
    await rm(sqliteFile, { force: true })
    const client = createClient({ url: `file:${sqliteFile}` })
    try {
      const migrations = readMigrationFiles({ migrationsFolder })
      await client.execute(
        "CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at NUMERIC)",
      )
      for (const migration of migrations.slice(0, 4)) {
        for (const statement of migration.sql) await client.execute(statement)
        await client.execute({
          sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
          args: [migration.hash, migration.folderMillis],
        })
      }
      const updatedAt = new Date("2025-01-02T03:04:05.000Z")
      await client.execute({
        sql: "INSERT INTO pages (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)",
        args: [
          "/existing",
          JSON.stringify(INITIAL_DATA),
          updatedAt.getTime() / 1000,
          "original@example.com",
        ],
      })
      const db = drizzle(client, { schema })
      await migrate(db, { migrationsFolder })
      const adapter = getAdapter(() => db)
      expect(await adapter.getFragmentData({ key: "/existing", type: "page" })).toEqual(
        INITIAL_DATA,
      )
      expect(await adapter.getAllFragments({ type: "page" })).toEqual([
        { key: "/existing", type: "page", updatedAt, updatedBy: "original@example.com" },
      ])
      expect(await adapter.getAllFragments({ type: "shared" })).toEqual([])
    } finally {
      await client.close()
      await rm(sqliteFile, { force: true })
    }
  })
})

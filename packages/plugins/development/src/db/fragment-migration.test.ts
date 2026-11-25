import { mkdir, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import { describe, expect, it } from "@dev/vitest"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"

const rootDirectory = resolve(import.meta.dirname, "../../../../../")
const migrationsFolder = resolve(import.meta.dirname, "./migrations")
const legacyFile = resolve(rootDirectory, ".tmp/development-fragment-migration.test.db")

describe("development fragment migration", { tags: ["ai", "feature-shared-components"] }, () => {
  it("upgrades the migration history and preserves existing Page records", async () => {
    await mkdir(dirname(legacyFile), { recursive: true })
    await rm(legacyFile, { force: true })

    const client = createClient({ url: `file:${legacyFile}` })
    const data = JSON.stringify({ content: [], root: { props: { title: "Existing Page" } } })
    const updatedAt = 1_798_761_600
    const updatedBy = "editor@example.com"

    try {
      const migrations = readMigrationFiles({ migrationsFolder })
      const boundary = migrations.findIndex(({ name }) => name.endsWith("_fragment_storage"))
      expect(boundary).toBeGreaterThan(0)

      await client.execute(
        "CREATE TABLE __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)",
      )
      for (const migration of migrations.slice(0, boundary)) {
        await client.executeMultiple(migration.sql.join("\n"))
        await client.execute({
          sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
          args: [migration.hash, migration.folderMillis + 321],
        })
      }

      await client.execute({
        sql: "INSERT INTO pages (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)",
        args: ["/existing", data, updatedAt, updatedBy],
      })

      await migrate(drizzle({ client }), { migrationsFolder })

      const history = await client.execute("SELECT name FROM __drizzle_migrations ORDER BY name")
      expect(history.rows.map(({ name }) => name)).toEqual(
        migrations.map(({ name }) => name).sort(),
      )
      const migrated = await client.execute(
        "SELECT key, type, data, updated_at, updated_by FROM fragments",
      )
      expect(migrated.rows).toEqual([
        {
          key: "/existing",
          type: "page",
          data,
          updated_at: updatedAt * 1000,
          updated_by: updatedBy,
        },
      ])
    } finally {
      await client.close()
      await rm(legacyFile, { force: true })
    }
  })
})

import { mkdir, readFile, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import { describe, expect, it } from "@dev/vitest"
import { createClient } from "@libsql/client"

const rootDirectory = resolve(import.meta.dirname, "../../../../../")

const migrationFile = resolve(import.meta.dirname, "./migrations/0004_fragment_storage.sql")

const legacyFile = resolve(rootDirectory, ".tmp/development-fragment-migration.test.db")

describe("development fragment migration", { tags: ["ai", "feature-shared-components"] }, () => {
  it("migrates existing Pages into page Fragments without changing their data", async () => {
    await mkdir(dirname(legacyFile), { recursive: true })
    await rm(legacyFile, { force: true })

    const legacyClient = createClient({ url: `file:${legacyFile}` })
    const data = JSON.stringify({ content: [], root: { props: { title: "Existing Page" } } })
    const updatedAt = 1_798_761_600
    const updatedBy = "editor@example.com"

    try {
      await legacyClient.execute(
        "CREATE TABLE pages (key text PRIMARY KEY NOT NULL, data text NOT NULL, updated_at integer NOT NULL, updated_by text NOT NULL)",
      )
      await legacyClient.execute({
        sql: "INSERT INTO pages (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)",
        args: ["/existing", data, updatedAt, updatedBy],
      })

      await legacyClient.executeMultiple(await readFile(migrationFile, "utf8"))

      const migrated = await legacyClient.execute(
        "SELECT key, type, data, updated_at, updated_by FROM fragments",
      )

      expect(migrated.rows).toEqual([
        {
          key: "/existing",
          type: "page",
          data,
          updated_at: updatedAt,
          updated_by: updatedBy,
        },
      ])
    } finally {
      await legacyClient.close()
      await rm(legacyFile, { force: true })
    }
  })
})

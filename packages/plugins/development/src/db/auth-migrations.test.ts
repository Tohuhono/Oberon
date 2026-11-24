import { mkdir, readFile, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "@dev/vitest"
import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

import * as schema from "./schema"

const rootDirectory = resolve(import.meta.dirname, "../../../../../")

const migrationsFolder = resolve(import.meta.dirname, "./migrations")

const sqliteFile = resolve(rootDirectory, ".tmp/development-auth-migrations.test.db")

describe("development auth migrations", { tags: ["ai", "feature-better-auth-migration"] }, () => {
  let client: Client

  async function getTableNames() {
    const result = await client.execute("select name from sqlite_master where type = 'table'")

    return new Set(result.rows.map((row) => String(row.name)))
  }

  async function getTableColumns(tableName: string) {
    const result = await client.execute(`pragma table_info(${tableName})`)

    return new Set(result.rows.map((row) => String(row.name)))
  }

  beforeEach(async () => {
    await mkdir(dirname(sqliteFile), { recursive: true })
    await rm(sqliteFile, { force: true })

    client = createClient({ url: `file:${sqliteFile}` })
    const db = drizzle(client, { schema })

    await migrate(db, { migrationsFolder })
  })

  afterEach(async () => {
    await client.close()
    await rm(sqliteFile, { force: true })
  })

  it("creates better-auth core tables and keeps role on user", async () => {
    const tableNames = await getTableNames()

    expect(tableNames.has("user")).toBe(true)
    expect(tableNames.has("session")).toBe(true)
    expect(tableNames.has("account")).toBe(true)
    expect(tableNames.has("verification")).toBe(true)
    expect(tableNames.has("verificationToken")).toBe(false)

    const userColumns = await getTableColumns("user")
    const sessionColumns = await getTableColumns("session")
    const accountColumns = await getTableColumns("account")
    const verificationColumns = await getTableColumns("verification")

    expect(userColumns.has("id")).toBe(true)
    expect(userColumns.has("email")).toBe(true)
    expect(userColumns.has("role")).toBe(true)
    expect(userColumns.has("email_verified")).toBe(true)
    expect(userColumns.has("created_at")).toBe(true)
    expect(userColumns.has("updated_at")).toBe(true)

    expect(sessionColumns.has("token")).toBe(true)
    expect(sessionColumns.has("expires_at")).toBe(true)

    expect(accountColumns.has("provider_id")).toBe(true)
    expect(accountColumns.has("account_id")).toBe(true)

    expect(verificationColumns.has("value")).toBe(true)
    expect(verificationColumns.has("expires_at")).toBe(true)
  })

  it("migrates existing Pages into page Fragments without changing their data", async () => {
    const legacyFile = resolve(rootDirectory, ".tmp/development-fragment-migration.test.db")
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

      const migration = await readFile(
        resolve(migrationsFolder, "0004_fragment_storage.sql"),
        "utf8",
      )
      await legacyClient.executeMultiple(migration)

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

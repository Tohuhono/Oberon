import { mkdir, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient, type Client } from "@libsql/client"
import { afterEach, beforeEach, describe, expect, it } from "@dev/vitest"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import * as schema from "./schema"

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../",
)

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./migrations",
)

const sqliteFile = resolve(
  rootDirectory,
  ".tmp/development-auth-migrations.test.db",
)

describe(
  "development auth migrations",
  { tags: ["ai", "feature-better-auth-migration"] },
  () => {
    let client: Client

    async function getTableNames() {
      const result = await client.execute(
        "select name from sqlite_master where type = 'table'",
      )

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
  },
)

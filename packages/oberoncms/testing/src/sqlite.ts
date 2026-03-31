import { mkdir, rm } from "fs/promises"
import { dirname } from "path"
import { createClient } from "@libsql/client"
import { fromPartial } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

type OnCleanup = (callback: () => Promise<void>) => void

export function createSqliteAdapterFactory<
  TSchema extends Record<string, unknown>,
>({
  sqliteFile,
  schema,
  migrationsFolder,
  getAdapter,
}: {
  sqliteFile: string
  schema: TSchema
  migrationsFolder?: string
  getAdapter: (db: LibSQLDatabase<TSchema>) => Partial<OberonPluginAdapter>
}) {
  return async (onCleanup: OnCleanup): Promise<OberonPluginAdapter> => {
    await mkdir(dirname(sqliteFile), { recursive: true })
    await rm(sqliteFile, { force: true })

    const client = createClient({ url: `file:${sqliteFile}` })
    const db = drizzle(client, { schema })

    if (migrationsFolder) {
      await migrate(db, { migrationsFolder })
    }

    onCleanup(async () => {
      await client.close()
      await rm(sqliteFile, { force: true })
    })

    return fromPartial({
      prebuild: async () => {},
      ...getAdapter(db),
    })
  }
}

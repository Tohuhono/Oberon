import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@libsql/client"
import { fromPartial } from "@dev/vitest"
import type { OberonPluginAdapter } from "@oberoncms/core"
import { getAdapter, migrate } from "@oberoncms/sqlite/adapter"
import * as schema from "@oberoncms/sqlite/schema"
import { drizzle } from "drizzle-orm/libsql"

type OnCleanup = (callback: () => Promise<void>) => void

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../plugins/development/src/db/migrations",
)

export function createStorageAdapterFactory({
  sqliteFile,
}: {
  sqliteFile: string
}) {
  return async (onCleanup: OnCleanup): Promise<OberonPluginAdapter> => {
    await mkdir(dirname(sqliteFile), { recursive: true })
    await rm(sqliteFile, { force: true })

    const client = createClient({ url: `file:${sqliteFile}` })
    const db = drizzle(client, { schema })

    await migrate(db, { migrationsFolder })

    onCleanup(async () => {
      await client.close()
      await rm(sqliteFile, { force: true })
    })

    return fromPartial({
      prebuild: async () => {},
      ...getAdapter(() => db),
    })
  }
}

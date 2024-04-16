/* eslint-env node */
import { createWriteStream } from "fs"
import { mkdir } from "fs/promises"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

dotenv.config({ path: ".env.local" })

const pages = sqliteTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
})

const createRemoteClient = async () => {
  if (!process.env.TURSO_URL || !process.env.TURSO_TOKEN) {
    throw new Error(
      "No remote database credentials supplied: have you set TURSO_URL and TURSO_TOKEN?",
    )
  }

  const { createClient } = await import("@libsql/client/web")
  return createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  })
}

const createLocalClient = async () => {
  const { createClient } = await import("@libsql/client")

  return createClient({
    url: process.env.TURSO_FILE || "file:.oberon/oberon.db",
  })
}

const getClient = () => {
  if (process.env.TURSO_USE_REMOTE === "true") {
    return createRemoteClient()
  }
  if (process.env.TURSO_USE_REMOTE === "false") {
    return createLocalClient()
  }

  if (process.env.NODE_ENV === "production") {
    return createRemoteClient()
  }
  return createLocalClient()
}

;(async () => {
  console.log(`Migrating database`)

  const client = await getClient()

  if (!client) {
    console.log("Prepare: No Database Connection Configured")
    return
  }

  const db = drizzle(client)

  await migrate(db, {
    migrationsFolder: "node_modules/@oberoncms/adapter-turso/src/db/migrations",
  })

  const results = await db
    .select({
      data: pages.data,
    })
    .from(pages)

  client.close()

  console.log("Extracting tailwind classes")

  const regex = /"className":"([^"]*)"/gm

  await mkdir(".oberon", { recursive: true })
  var outFile = await createWriteStream(".oberon/tailwind.classes")

  for (const { data } of results) {
    if (data) {
      for (const match of data.matchAll(regex)) {
        outFile.write(match[1])
        outFile.write("\n")
      }
    }
  }

  outFile.write("\n")
  outFile.end()

  console.log("Prepare script complete")
})()

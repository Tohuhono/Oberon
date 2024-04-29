/* eslint-env node */
import { createWriteStream } from "fs"
import { mkdir } from "fs/promises"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/vercel-postgres"
import { migrate } from "drizzle-orm/pg/migrator"
import { sql } from "@vercel/postgres"
import { pgTable, text } from "drizzle-orm/pg-core"

dotenv.config({ path: ".env.local" })

const pages = pgTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
})

;(async () => {
  console.log(`Migrating database`)

  const db = drizzle(sql)

  await migrate(db, {
    migrationsFolder: "node_modules/@oberoncms/adapter-turso/src/db/migrations",
  })

  const results = await db
    .select({
      data: pages.data,
    })
    .from(pages)

  sql.close()

  console.log("Extracting tailwind classes")

  const regex = /"className":"([^"]*)"/gm

  await mkdir(".oberon", { recursive: true })
  var outFile = createWriteStream(".oberon/tailwind.classes")

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

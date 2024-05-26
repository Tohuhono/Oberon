#!/usr/bin/env node
/* eslint-env node */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createWriteStream } from "fs"
import { mkdir } from "fs/promises"
import { drizzle } from "drizzle-orm/vercel-postgres"
import { migrate } from "drizzle-orm/vercel-postgres/migrator"
import { sql } from "@vercel/postgres"
import { pgTable, text } from "drizzle-orm/pg-core"

const pages = pgTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
})

;(async () => {
  console.log(`Migrating database`)

  const db = drizzle(sql)

  await migrate(db, {
    migrationsFolder:
      "node_modules/@oberoncms/plugin-vercel-postgres/src/db/migrations",
  })

  const results = await db
    .select({
      data: pages.data,
    })
    .from(pages)

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

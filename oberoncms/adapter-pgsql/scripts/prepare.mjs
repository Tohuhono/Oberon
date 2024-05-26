#!/usr/bin/env node
/* eslint-env node */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createWriteStream } from "fs"
import { mkdir } from "fs/promises"
import { migrate } from "drizzle-orm/node-postgres/migrator"

import { drizzle } from "drizzle-orm/node-postgres"
import { pgTable, text } from "drizzle-orm/pg-core"

import Pg from "pg"

const { Pool } = Pg

const pages = pgTable("pages", {
  key: text("key").notNull().primaryKey(),
  data: text("data"),
})

const createRemoteClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No remote database credentials supplied: have you set database credentials?",
    )
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

;(async () => {
  console.log(`Migrating database`)
  const client = createRemoteClient()
  if (!client) {
    console.log("Prepare: No Database Connection Configured")
    return
  }

  const db = drizzle(client)

  await migrate(db, {
    migrationsFolder: "node_modules/@oberoncms/adapter-pgsql/src/db/migrations",
  })

  const results = await db.select({ data: pages.data }).from(pages)

  console.log("Extracting tailwind classes")

  const regex = /"className":"([^"]*)"/gm

  await mkdir(".oberon", { recursive: true })
  var outFile = createWriteStream(".oberon/tailwind.classes")

  for (const { data } of results) {
    if (data) {
      for (const match of JSON.stringify(data).matchAll(regex)) {
        outFile.write(match[1])
        outFile.write("\n")
      }
    }
  }

  outFile.write("\n")
  outFile.end()

  console.log("Prepare script complete")
  process.exit(0)
})()

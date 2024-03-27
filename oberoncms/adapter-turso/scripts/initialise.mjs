#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable import/order */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { mkdir } from "fs/promises"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
;(async () => {
  if (process.env.CI) {
    return
  }

  await mkdir(".oberon", { recursive: true })

  const db = createClient({
    url: "file:.oberon/oberon.db",
  })

  await db.execute(`PRAGMA journal_mode=WAL;`)

  const client = drizzle(db)

  await migrate(client, {
    migrationsFolder: "node_modules/@oberoncms/adapter-turso/src/db/migrations",
  })

  console.log("Database migrations completed")
})()

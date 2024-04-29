#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable import/order */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { drizzle } from "drizzle-orm/vercel-postgres"
import { migrate } from "drizzle-orm/pg/migrator"
import { sql } from "@vercel/postgres"

import { mkdir } from "fs/promises"
;(async () => {
  if (process.env.CI) {
    return
  }

  await mkdir(".oberon", { recursive: true })

  const client = drizzle(sql)

  await migrate(client, {
    migrationsFolder:
      "node_modules/@oberoncms/adapter-vercel-postgres/src/db/migrations",
  })

  console.log("Database migrations completed")
})()

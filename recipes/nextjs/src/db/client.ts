/* eslint-disable @typescript-eslint/no-var-requires */
import "server-only"

import { drizzle } from "drizzle-orm/libsql"

// import type from here as
import type { Client } from "@libsql/core/api"

import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var oberonDb: Client
}

const getClient = () => {
  if (
    (process.env.NODE_ENV === "production" ||
      process.env.TURSO_USE_REMOTE === "true") &&
    process.env.TURSO_URL &&
    process.env.TURSO_TOKEN
  ) {
    const { createClient } = require("@libsql/client/web")
    return createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    })
  }
  if (process.env.NODE_ENV === "development") {
    const { createClient } = require("@libsql/client")

    return createClient({
      url: "file:.db/oberon.db",
    })
  }
  throw new Error("No Database Connection Configured")
}

// ensure there is only one database client
const client: Client =
  globalThis.oberonDb || (globalThis.oberonDb = getClient())

export const db = drizzle(client, {
  schema,
})

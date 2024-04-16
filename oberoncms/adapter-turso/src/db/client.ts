/* eslint-disable @typescript-eslint/no-var-requires */
// TODO import "server-only"

import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web"

// import type from here as
import type { Client } from "@libsql/core/api"

import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var oberonDb: Client
}

const createRemoteClient = () => {
  if (!process.env.TURSO_URL || !process.env.TURSO_TOKEN) {
    throw new Error(
      "No remote database credentials supplied: have you set TURSO_URL and TURSO_TOKEN?",
    )
  }

  return createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  })
}

const createLocalClient = () => {
  const localClient = require("@libsql/client")

  return localClient.createClient({
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

// ensure there is only one database client
const client: Client =
  globalThis.oberonDb || (globalThis.oberonDb = getClient())

export const db = drizzle(client, {
  schema,
})

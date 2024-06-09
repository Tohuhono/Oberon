/* eslint-disable @typescript-eslint/no-var-requires */
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web"
import * as schema from "./schema"

export const getClient = () => {
  if (!process.env.TURSO_URL || !process.env.TURSO_TOKEN) {
    throw new Error(
      "No remote database credentials supplied: have you set TURSO_URL and TURSO_TOKEN?",
    )
  }

  return drizzle(
    createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    }),
    {
      schema,
    },
  )
}

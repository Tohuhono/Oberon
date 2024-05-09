import { type Adapter } from "@auth/core/adapters"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "../db/client"

export const adapter = DrizzleAdapter(db) satisfies Adapter

import { db } from "src/db/client"
import { type Adapter } from "@auth/core/adapters"
import { DrizzleAdapter } from "@auth/drizzle-adapter"

export const adapter = DrizzleAdapter(db) satisfies Adapter

import { db } from "src/db/client"

import { DrizzleAdapter } from "@auth/drizzle-adapter"

export const adapter = DrizzleAdapter(db)

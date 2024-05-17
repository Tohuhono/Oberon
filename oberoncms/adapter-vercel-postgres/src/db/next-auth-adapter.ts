import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "../db/client"

export const authAdapter = DrizzleAdapter(db)

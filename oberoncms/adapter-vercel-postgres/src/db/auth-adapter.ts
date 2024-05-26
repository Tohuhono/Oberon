import { DrizzleAdapter } from "@auth/drizzle-adapter"
import type { OberonAuthAdapter } from "@oberoncms/core"
import { db } from "./client"

export const authAdapter = DrizzleAdapter(db) as OberonAuthAdapter

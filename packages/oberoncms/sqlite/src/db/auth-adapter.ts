import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { type OberonAuthAdapter } from "@oberoncms/core"
import type { DatabaseClient } from "./client"
import { users } from "./schema"

export const getAuthAdapter = (
  db: () => DatabaseClient,
): OberonAuthAdapter => ({
  getAllUsers: async () => {
    return await db()
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
  },
  addUser: async ({ email, role }) => {
    return db()
      .insert(users)
      .values({ email, role, id: randomUUID(), emailVerified: null })
      .returning()
      .get()
  },
  deleteUser: async (id) => {
    await db().delete(users).where(eq(users.id, id)).returning().get()
  },
  changeRole: async ({ role, id }) => {
    await db().update(users).set({ role }).where(eq(users.id, id)).execute()
  },
})

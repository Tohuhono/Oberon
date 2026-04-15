import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { type OberonAuthAdapter } from "@oberoncms/core"
import type { DatabaseClient } from "./client"
import { users } from "./schema"

export const getAuthAdapter = (db: DatabaseClient): OberonAuthAdapter => ({
  getAllUsers: async () => {
    return await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .execute()
  },
  addUser: async ({ email, role }) => {
    const result = await db
      .insert(users)
      .values({ id: randomUUID(), email, role, emailVerified: null })
      .returning({ id: users.id, email: users.email, role: users.role })
      .execute()

    const createdUser = result[0]

    if (!createdUser) {
      throw new Error("Failed to create user.")
    }

    return createdUser
  },
  deleteUser: async (id) => {
    await db.delete(users).where(eq(users.id, id)).execute()
  },
  changeRole: async ({ role, id }) => {
    await db.update(users).set({ role }).where(eq(users.id, id)).execute()
  },
})

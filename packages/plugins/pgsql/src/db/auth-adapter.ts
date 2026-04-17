import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { UserSchema, type OberonAuthAdapter } from "@oberoncms/core"
import { z } from "zod"
import type { DatabaseClient } from "./client"
import { user } from "./schema"

export const getAuthAdapter = (db: DatabaseClient): OberonAuthAdapter => ({
  getAllUsers: async () => {
    return z
      .array(UserSchema)
      .parse(
        await db
          .select({ id: user.id, email: user.email, role: user.role })
          .from(user)
          .execute(),
      )
  },
  addUser: async ({ email, role }) => {
    const result = await db
      .insert(user)
      .values({ id: randomUUID(), name: email, email, role })
      .returning({ id: user.id, email: user.email, role: user.role })
      .execute()

    const createdUser = result[0]

    if (!createdUser) {
      throw new Error("Failed to create user.")
    }

    return UserSchema.parse(createdUser)
  },
  deleteUser: async (id) => {
    await db.delete(user).where(eq(user.id, id)).execute()
  },
  changeRole: async ({ role, id }) => {
    await db.update(user).set({ role }).where(eq(user.id, id)).execute()
  },
})

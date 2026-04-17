import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { UserSchema, type OberonAuthAdapter } from "@oberoncms/core"
import { z } from "zod"
import type { DatabaseClient } from "./client"
import { user } from "./schema"

export const getAuthAdapter = (
  db: () => DatabaseClient,
): OberonAuthAdapter => ({
  getAllUsers: async () => {
    return z
      .array(UserSchema)
      .parse(
        await db()
          .select({ id: user.id, email: user.email, role: user.role })
          .from(user)
          .execute(),
      )
  },
  addUser: async ({ email, role }) => {
    return UserSchema.parse(
      await db()
        .insert(user)
        .values({
          id: randomUUID(),
          name: email,
          email,
          role,
        })
        .returning()
        .get(),
    )
  },
  deleteUser: async (id) => {
    await db().delete(user).where(eq(user.id, id)).returning().get()
  },
  changeRole: async ({ role, id }) => {
    await db().update(user).set({ role }).where(eq(user.id, id)).execute()
  },
})

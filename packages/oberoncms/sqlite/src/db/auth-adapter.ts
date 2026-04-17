import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { BetterAuthOptions } from "better-auth"
import { UserSchema, type OberonAuthAdapter } from "@oberoncms/core"
import { z } from "zod"
import type { DatabaseClient } from "./client"
import * as schema from "./schema"
import { user } from "./schema"

type SqliteAuthAdapter = OberonAuthAdapter & {
  betterAuth: Pick<BetterAuthOptions, "database">
}

function createBetterAuthAdapter(
  db: () => DatabaseClient,
): Pick<BetterAuthOptions, "database"> {
  let database: BetterAuthOptions["database"] | undefined

  return {
    get database() {
      database ??= drizzleAdapter(db(), {
        provider: "sqlite",
        schema,
      })

      return database
    },
  } satisfies Pick<BetterAuthOptions, "database">
}

export const getAuthAdapter = (
  db: () => DatabaseClient,
): SqliteAuthAdapter => ({
  betterAuth: createBetterAuthAdapter(db),
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

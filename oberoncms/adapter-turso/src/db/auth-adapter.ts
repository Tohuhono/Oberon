import { randomUUID } from "crypto"
import { eq, and } from "drizzle-orm"
import type { OberonAuthAdapter } from "@oberoncms/core"
import { db } from "./client"
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "./schema/next-auth-schema"

function LibsqlDrizzleAdapter(client: typeof db): OberonAuthAdapter {
  return {
    async createUser(data) {
      return client
        .insert(users)
        .values({ ...data, id: randomUUID() })
        .returning()
        .get()
    },
    async getUser(data) {
      return (
        (await client.select().from(users).where(eq(users.id, data)).get()) ??
        null
      )
    },
    async getUserByEmail(data) {
      return (
        (await client
          .select()
          .from(users)
          .where(eq(users.email, data))
          .get()) ?? null
      )
    },
    async createSession(data) {
      return client.insert(sessions).values(data).returning().get()
    },
    async getSessionAndUser(data) {
      return (
        (await client
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, data))
          .innerJoin(users, eq(users.id, sessions.userId))
          .get()) ?? null
      )
    },
    async updateUser(data) {
      if (!data.id) {
        throw new Error("No user id.")
      }

      return client
        .update(users)
        .set(data)
        .where(eq(users.id, data.id))
        .returning()
        .get()
    },
    async updateSession(data) {
      return client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .get()
    },
    async linkAccount(rawAccount) {
      const updatedAccount = await client
        .insert(accounts)
        .values(rawAccount)
        .returning()
        .get()

      const account = {
        ...updatedAccount,
        type: updatedAccount.type,
        access_token: updatedAccount.access_token ?? undefined,
        token_type:
          (updatedAccount.token_type as Lowercase<string>) ?? undefined,
        id_token: updatedAccount.id_token ?? undefined,
        refresh_token: updatedAccount.refresh_token ?? undefined,
        scope: updatedAccount.scope ?? undefined,
        expires_at: updatedAccount.expires_at ?? undefined,
        session_state: updatedAccount.session_state ?? undefined,
      }

      return account
    },
    async getUserByAccount(account) {
      const results = await client
        .select()
        .from(accounts)
        .leftJoin(users, eq(users.id, accounts.userId))
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId),
          ),
        )
        .get()

      return results?.user ?? null
    },
    async deleteSession(sessionToken) {
      return (
        (await client
          .delete(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .returning()
          .get()) ?? null
      )
    },
    async createVerificationToken(token) {
      return client.insert(verificationTokens).values(token).returning().get()
    },
    async useVerificationToken(token) {
      try {
        return (
          (await client
            .delete(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token),
              ),
            )
            .returning()
            .get()) ?? null
        )
      } catch (err) {
        throw new Error("No verification token found.")
      }
    },
    async deleteUser(id) {
      await client.delete(users).where(eq(users.id, id)).returning().get()
    },
    async unlinkAccount(account) {
      await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        )
        .run()

      return undefined
    },
  }
}

export const authAdapter: OberonAuthAdapter = LibsqlDrizzleAdapter(db)

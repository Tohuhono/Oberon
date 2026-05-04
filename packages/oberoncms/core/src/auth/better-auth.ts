import { headers } from "next/headers"
import { toNextJsHandler } from "better-auth/next-js"

import { name, version } from "../../package.json" with { type: "json" }
import { type OberonPlugin, type OberonPluginAdapter } from "../lib/dtd"
import { createAuthServer } from "./server"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const authPlugin: OberonPlugin = (adapter) => {
  const authServer = () =>
    createAuthServer({
      betterAuth: adapter.betterAuth,
      sendVerificationRequest: adapter.sendVerificationRequest,
    })

  const ensureMasterUser = async () => {
    const masterEmail = process.env.MASTER_EMAIL

    if (!masterEmail) {
      return
    }

    const normalizedMasterEmail = normalizeEmail(masterEmail)
    const users = await adapter.getAllUsers()
    const hasMasterUser = users.some(
      (user) => normalizeEmail(user.email) === normalizedMasterEmail,
    )

    if (!hasMasterUser) {
      await adapter.addUser({
        email: normalizedMasterEmail,
        role: "admin",
      })
    }
  }

  return {
    name: `${name}/auth`,
    version,
    handlers: {
      auth: () => toNextJsHandler(authServer()),
    },
    adapter: {
      prebuild: async () => {
        await adapter.prebuild()
        await ensureMasterUser()
      },
      getCurrentUser: async () => {
        try {
          const session = await authServer().api.getSession({
            headers: await headers(),
          })

          if (!session?.user?.id || !session.user.email || !session.user.role) {
            return null
          }

          return {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }
        } catch {
          return null
        }
      },
      signOut: async () => {
        await authServer().api.signOut({
          headers: await headers(),
        })
      },
      signIn: async ({ email }) => {
        await authServer().api.sendVerificationOTP({
          body: { email, type: "sign-in" },
        })
      },
    } satisfies Partial<OberonPluginAdapter>,
  }
}

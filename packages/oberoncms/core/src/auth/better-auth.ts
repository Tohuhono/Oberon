import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth/minimal"
import { emailOTP } from "better-auth/plugins/email-otp"

import { name, version } from "../../package.json" with { type: "json" }
import { type OberonPlugin, type OberonPluginAdapter } from "../lib/dtd"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const cmsAuthBasePath = "/cms/api/auth"
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"
const secret = process.env.AUTH_SECRET

export const authPlugin: OberonPlugin = (adapter) => {
  const options = {
    ...(adapter.betterAuth && { database: adapter.betterAuth.database }),
    basePath: cmsAuthBasePath,
    baseURL,
    secret,
    user: {
      additionalFields: {
        role: {
          type: "string" as const,
          required: true,
          input: false,
        },
      },
    },
    plugins: [
      emailOTP({
        disableSignUp: true,

        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type !== "sign-in") {
            return
          }

          const loginUrl = new URL("/cms/login", "http://localhost")
          loginUrl.searchParams.set("email", email)

          await adapter.sendVerificationRequest({
            email,
            token: otp,
            url: `${loginUrl.pathname}${loginUrl.search}`,
          })
        },
      }),
    ],
  } satisfies BetterAuthOptions

  const authServer = betterAuth(options)

  const getRequestHeaders = () => adapter.getRequestHeaders()

  const handleAuthRequest = async (request: Request) => authServer.handler(request)

  const ensureMasterUser = async () => {
    const masterEmail = process.env.MASTER_EMAIL
    if (!masterEmail) {
      return
    }

    const normalizedMasterEmail = normalizeEmail(masterEmail)
    const users = await adapter.getAllUsers()
    const hasMasterUser = users.some((user) => normalizeEmail(user.email) === normalizedMasterEmail)

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
      auth: () => ({
        GET: handleAuthRequest,
        POST: handleAuthRequest,
        PATCH: handleAuthRequest,
        PUT: handleAuthRequest,
        DELETE: handleAuthRequest,
      }),
    },
    bootstrap: async (next) => {
      await next()
      await ensureMasterUser()
    },
    adapter: {
      getCurrentUser: async () => {
        try {
          const session = await authServer.api.getSession({
            headers: await getRequestHeaders(),
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
        await authServer.api.signOut({
          headers: await getRequestHeaders(),
        })
      },
      signIn: async ({ email }) => {
        await authServer.api.sendVerificationOTP({
          body: { email, type: "sign-in" },
        })
      },
    } satisfies Partial<OberonPluginAdapter>,
  }
}

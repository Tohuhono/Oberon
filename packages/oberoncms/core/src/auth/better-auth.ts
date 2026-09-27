import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth/minimal"
import { emailOTP } from "better-auth/plugins/email-otp"

import { name, version } from "../../package.json" with { type: "json" }
import { type OberonPlugin, type OberonPluginAdapter } from "../lib/dtd"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const cmsAuthBasePath = "/cms/api/auth"
const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BASE_URL)
const secret = process.env.AUTH_SECRET

const getAuth = (
  adapter: Pick<
    OberonPluginAdapter,
    "getAuthDatabase" | "getAuthPlugins" | "sendVerificationRequest"
  >,
) =>
  betterAuth({
    database: adapter.getAuthDatabase(),
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

        sendVerificationOTP: async ({ email, otp, type }, ctx) => {
          if (type !== "sign-in") {
            return
          }

          const loginUrl = new URL("/cms/login", ctx?.context.baseURL || "")
          loginUrl.searchParams.set("email", email)
          loginUrl.searchParams.set("token", otp)

          await adapter.sendVerificationRequest({
            email,
            token: otp,
            url: loginUrl.toString(),
          })
        },
      }),
      ...adapter.getAuthPlugins(),
    ],
  } satisfies BetterAuthOptions)

async function ensureMasterUser(adapter: OberonPluginAdapter) {
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

export const authPlugin: OberonPlugin = () => ({
  name: `${name}/auth`,
  version,
  handlers: {
    auth: ({ pluginAdapter }) => {
      const handleAuthRequest = async (request: Request) => getAuth(pluginAdapter).handler(request)

      return {
        GET: handleAuthRequest,
        POST: handleAuthRequest,
        PATCH: handleAuthRequest,
        PUT: handleAuthRequest,
        DELETE: handleAuthRequest,
      }
    },
  },
  bootstrap: async ({ adapter }) => {
    await ensureMasterUser(adapter)
  },
  adapter: {
    getCurrentUser:
      ({ adapter }) =>
      async () => {
        try {
          const session = await getAuth(adapter).api.getSession({
            headers: await adapter.getRequestHeaders(),
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
    signOut:
      ({ adapter }) =>
      async () => {
        await getAuth(adapter).api.signOut({
          headers: await adapter.getRequestHeaders(),
        })
      },
    signIn:
      ({ adapter }) =>
      async ({ email }) => {
        await getAuth(adapter).api.sendVerificationOTP({
          body: { email, type: "sign-in" },
          headers: await adapter.getRequestHeaders(),
        })
      },
  },
})

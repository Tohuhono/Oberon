import { name, version } from "../../package.json" with { type: "json" }
import { NotImplementedError, type OberonPlugin, type OberonPluginAdapter } from "../lib/dtd"
import { createAuthServer } from "./server"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const authPlugin: OberonPlugin = (adapter) => {
  const getAuthPlugins = () => {
    try {
      return adapter.getAuthPlugins()
    } catch (error) {
      if (error instanceof NotImplementedError) {
        return []
      }

      throw error
    }
  }

  const authServer = () =>
    createAuthServer({
      betterAuth: adapter.betterAuth,
      betterAuthPlugins: getAuthPlugins(),
      sendVerificationRequest: adapter.sendVerificationRequest,
    })

  const getRequestHeaders = () => adapter.getRequestHeaders()

  const handleAuthRequest = async (request: Request) => authServer().handler(request)

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
          const session = await authServer().api.getSession({
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
        await authServer().api.signOut({
          headers: await getRequestHeaders(),
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

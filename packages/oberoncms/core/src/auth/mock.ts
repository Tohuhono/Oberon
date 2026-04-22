import { randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { toNextJsHandler } from "better-auth/next-js"

import { name, version } from "../../package.json" with { type: "json" }
import {
  type OberonAuthAdapter,
  type OberonCanAdapter,
  type OberonPlugin,
  type OberonRole,
  type OberonUser,
} from "../lib/dtd"
import { createAuthServer } from "./server"

const sessionCookieName = "oberon-auth-session"
const otpCookieName = "oberon-auth-otp"
const otpTtlMs = 10 * 60 * 1000
const sessionTtlMs = 12 * 60 * 60 * 1000

const mockUsers = new Map<string, OberonUser>([
  [
    "test@tohuhono.com",
    {
      id: "mock-admin",
      email: "test@tohuhono.com",
      role: "admin",
    },
  ],
])

type PendingOtp = {
  email: string
  token: string
  user: OberonUser
  expiresAt: number
}

type Session = {
  user: OberonUser
  expiresAt: number
}

function isOberonRole(value: unknown): value is OberonRole {
  return value === "admin" || value === "user"
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function getMasterEmail(): string | null {
  return process.env.MASTER_EMAIL || null
}

function getMasterUser(email: string): OberonUser | null {
  const masterEmail = getMasterEmail()

  if (!masterEmail || normalizeEmail(masterEmail) !== normalizeEmail(email)) {
    return null
  }

  return {
    id: email,
    email,
    role: "admin",
  }
}

function encodeState(value: PendingOtp | Session): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
}

function decodeState(value: string | undefined): unknown | null {
  if (!value) {
    return null
  }

  try {
    const parsed = Buffer.from(value, "base64url").toString("utf8")
    return JSON.parse(parsed)
  } catch {
    return null
  }
}

function isPendingOtp(value: unknown): value is PendingOtp {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("email" in value) || typeof value.email !== "string") {
    return false
  }

  if (!("token" in value) || typeof value.token !== "string") {
    return false
  }

  if (!("expiresAt" in value) || typeof value.expiresAt !== "number") {
    return false
  }

  if (!("user" in value)) {
    return false
  }

  return toOberonUser(value.user) !== null
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("expiresAt" in value) || typeof value.expiresAt !== "number") {
    return false
  }

  if (!("user" in value)) {
    return false
  }

  return toOberonUser(value.user) !== null
}

function getCookieFromHeader(
  header: string | null,
  name: string,
): string | undefined {
  if (!header) {
    return undefined
  }

  for (const pair of header.split(";")) {
    const [rawName, ...rawValue] = pair.trim().split("=")

    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="))
    }
  }

  return undefined
}

function clearCookieHeader(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(0).toUTCString()}`
}

function setCookieHeader({
  name,
  value,
  maxAge,
}: {
  name: string
  value: string
  maxAge: number
}): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAge)}`
}

async function getCookieStore() {
  try {
    return await cookies()
  } catch {
    return null
  }
}

function toOberonUser(user: unknown): OberonUser | null {
  if (typeof user !== "object" || user === null) {
    return null
  }

  if (!("id" in user) || typeof user.id !== "string") {
    return null
  }

  if (!("email" in user) || typeof user.email !== "string") {
    return null
  }

  const role = "role" in user && isOberonRole(user.role) ? user.role : "user"

  return {
    id: user.id,
    email: user.email,
    role,
  }
}

function buildOtpLoginUrl(
  email: string,
  token: string,
  callbackUrl: string,
): string {
  const url = new URL("/cms/login", "http://localhost")
  url.searchParams.set("callbackUrl", callbackUrl)
  url.searchParams.set("email", email)
  url.searchParams.set("token", token)
  return `${url.pathname}${url.search}`
}

function getCallbackUrl(rawValue: string | null): string {
  if (!rawValue) {
    return "/cms/pages"
  }

  try {
    const parsed = new URL(rawValue, "http://localhost")

    if (!parsed.pathname.startsWith("/cms")) {
      return "/cms/pages"
    }

    return `${parsed.pathname}${parsed.search}`
  } catch {
    return "/cms/pages"
  }
}

async function resolveExistingUser(email: string): Promise<OberonUser | null> {
  const masterUser = getMasterUser(email)
  if (masterUser) {
    return masterUser
  }

  return mockUsers.get(normalizeEmail(email)) || null
}

function isVerifyPath(path: string): boolean {
  return path.endsWith("/cms/api/auth/verify")
}

export function createAuthPlugin(
  createServer: (adapter: {
    betterAuth?: OberonAuthAdapter["betterAuth"]
    sendVerificationRequest: (props: {
      email: string
      token: string
      url: string
    }) => Promise<void>
  }) => ReturnType<typeof createAuthServer>,
): OberonPlugin {
  return (adapter) => {
    let authHandlers: ReturnType<typeof toNextJsHandler> | null = null

    const getAuthHandlers = () => {
      authHandlers ||= toNextJsHandler(
        createServer({
          betterAuth: adapter.betterAuth,
          sendVerificationRequest: adapter.sendVerificationRequest,
        }),
      )

      return authHandlers
    }

    const handleAuthCallback = async (request: Request) => {
      const url = new URL(request.url)
      if (!isVerifyPath(url.pathname)) {
        return new Response("", { status: 404 })
      }

      const email = normalizeEmail(url.searchParams.get("email") || "")
      const token = url.searchParams.get("token") || ""
      const callbackUrl = getCallbackUrl(url.searchParams.get("callbackUrl"))
      const pendingState = decodeState(
        getCookieFromHeader(request.headers.get("cookie"), otpCookieName),
      )
      const pending = isPendingOtp(pendingState) ? pendingState : null

      if (
        !pending ||
        pending.expiresAt < Date.now() ||
        normalizeEmail(pending.email) !== email ||
        pending.token !== token
      ) {
        return new Response("", { status: 401 })
      }

      const session: Session = {
        user: pending.user,
        expiresAt: Date.now() + sessionTtlMs,
      }

      const headers = new Headers({
        "content-type": "application/json",
      })

      headers.append(
        "set-cookie",
        setCookieHeader({
          name: sessionCookieName,
          value: encodeState(session),
          maxAge: sessionTtlMs / 1000,
        }),
      )

      headers.append("set-cookie", clearCookieHeader(otpCookieName))

      return new Response(
        JSON.stringify({
          callbackUrl,
          ok: true,
        }),
        {
          status: 200,
          headers,
        },
      )
    }

    return {
      name: `${name}/auth`,
      version,
      handlers: {
        auth: () => ({
          GET: async (request) => {
            const path = new URL(request.url).pathname

            if (isVerifyPath(path)) {
              return handleAuthCallback(request)
            }

            return getAuthHandlers().GET(request)
          },
          POST: async (request) => {
            const path = new URL(request.url).pathname

            if (isVerifyPath(path)) {
              return handleAuthCallback(request)
            }

            return getAuthHandlers().POST(request)
          },
        }),
      },
      adapter: {
        getCurrentUser: async () => {
          try {
            const store = await cookies()
            const sessionState = decodeState(
              store.get(sessionCookieName)?.value,
            )
            const session = isSession(sessionState) ? sessionState : null

            if (!session) {
              return null
            }

            if (session.expiresAt < Date.now()) {
              store.set(sessionCookieName, "", {
                path: "/",
                expires: new Date(0),
              })
              return null
            }

            const masterUser = getMasterUser(session.user.email)

            if (masterUser) {
              return masterUser
            }

            return session.user
          } catch {
            return null
          }
        },
        signOut: async () => {
          try {
            const store = await cookies()

            store.set(sessionCookieName, "", {
              path: "/",
              expires: new Date(0),
            })

            store.set(otpCookieName, "", {
              path: "/",
              expires: new Date(0),
            })
          } catch {
            return
          }
        },
        signIn: async ({ email }) => {
          const normalizedEmail = normalizeEmail(email)
          const user = await resolveExistingUser(normalizedEmail)

          if (!user) {
            return
          }

          const token = (
            parseInt(randomBytes(3).toString("hex"), 16) % 1_000_000
          )
            .toString()
            .padStart(6, "0")

          const pendingOtp: PendingOtp = {
            email: normalizedEmail,
            token,
            user,
            expiresAt: Date.now() + otpTtlMs,
          }

          const store = await getCookieStore()

          if (store) {
            store.set(otpCookieName, encodeState(pendingOtp), {
              httpOnly: true,
              path: "/",
              sameSite: "lax",
              maxAge: Math.floor(otpTtlMs / 1000),
            })
          }

          await adapter.sendVerificationRequest({
            email: normalizedEmail,
            token,
            url: buildOtpLoginUrl(normalizedEmail, token, "/cms/pages"),
          })
        },
      } satisfies Partial<OberonCanAdapter>,
    }
  }
}

export const authPlugin = createAuthPlugin(({ sendVerificationRequest }) =>
  createAuthServer({ sendVerificationRequest }),
)

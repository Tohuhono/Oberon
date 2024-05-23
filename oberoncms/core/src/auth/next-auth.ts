import { randomBytes } from "crypto"
import { type AuthConfig } from "@auth/core"
import NextAuth, { type NextAuthResult } from "next-auth"

import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import type { Adapter } from "@auth/core/adapters"
import type { OberonPlugin, OberonUser } from ".."

const masterEmail = process.env.MASTER_EMAIL || null

const withCallback = (url: string) => {
  const withCallback = new URL(url)

  const callbackUrl = new URL(
    withCallback.searchParams.get("callbackUrl") || "/cms",
  )

  callbackUrl.pathname = "/cms"

  withCallback.searchParams.set("callbackUrl", callbackUrl.toString())

  return withCallback.toString()
}

const SEND_VERIFICATION_REQUEST =
  process.env.EMAIL_SEND === "true" ||
  (process.env.NODE_ENV === "production" && process.env.EMAIL_SEND !== "false")

export function initAuth({
  databaseAdapter: db,
  sendVerificationRequest,
}: {
  databaseAdapter: Adapter
  sendVerificationRequest?: (props: {
    email: string
    token: string
    url: string
  }) => Promise<void>
}): NextAuthResult & { plugin: OberonPlugin } {
  const config = {
    pages: {
      verifyRequest: "/api/auth/verify",
    },
    providers: [
      {
        id: "email",
        type: "email",
        from: "notused",
        server: {},
        maxAge: 4 * 60 * 60,
        name: "Email",
        options: {},
        generateVerificationToken: () => {
          return parseInt(randomBytes(3).toString("hex"), 16)
            .toString()
            .slice(0, 6)
        },
        sendVerificationRequest: async ({
          identifier: email,
          url: baseUrl,
          token,
        }) => {
          const url = withCallback(baseUrl)

          if (!SEND_VERIFICATION_REQUEST) {
            console.log(`sendVerificationRequest email not sent`, {
              email,
              url,
            })
            return
          }

          await sendVerificationRequest?.({
            email,
            url,
            token,
          })
        },
      },
    ],
    session: {
      strategy: "jwt",
    },
    adapter: db,
    callbacks: {
      async signIn({ user, profile }) {
        // Master user override
        if (user?.email && masterEmail && user.email === masterEmail) {
          // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
          user.role = "admin"
          return true
        }
        // Existing user or email verification
        // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
        if (user?.role) {
          return true
        }
        // OAuth account first log in
        if (
          profile?.email_verified &&
          profile.email &&
          (await db.getUserByEmail?.(profile.email))
        ) {
          return true
        }
        return "/api/auth/verify?provider=email&type=email"
      },
      jwt({ token, user }) {
        if (user) {
          const role =
            user.email === masterEmail ? "admin" : (user as OberonUser).role
          token.role = role
        }
        return token
      },
      session({ session, token }) {
        // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
        session.user.role = token.role
        return session
      },
    },
  } satisfies AuthConfig

  const nextAuth = NextAuth(config)

  const GET = async (req: NextRequest) => {
    // safe links bot workaround https://github.com/nextauthjs/next-auth/issues/4965
    if (
      req.method === "GET" &&
      req.nextUrl.pathname === "/api/auth/callback/email" &&
      !req.nextUrl.searchParams.has("confirmed")
    ) {
      return new Response(
        redirect(
          `/api/auth/confirm?${new URLSearchParams(
            req.nextUrl.searchParams,
          ).toString()}`,
        ),
      )
    }

    return nextAuth.handlers.GET(req)
  }

  const plugin = () => ({
    getCurrentUser: async () => {
      const session = await nextAuth.auth()

      return (session?.user as OberonUser) || null
    },
  })

  return {
    ...nextAuth,
    handlers: {
      ...nextAuth.handlers,
      GET,
    },
    plugin,
  }
}

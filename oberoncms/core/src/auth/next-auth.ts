import { randomBytes } from "crypto"
import { type AuthConfig } from "@auth/core"
import NextAuth from "next-auth"

import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import type { Adapter } from "@auth/core/adapters"

const masterEmail = process.env.MASTER_EMAIL || null

const SEND_VERIFICATION_REQUEST =
  process.env.EMAIL_SEND === "true" ||
  (process.env.NODE_ENV === "production" && process.env.EMAIL_SEND !== "false")

export function initAuth({
  adapter,
  sendVerificationRequest,
}: {
  adapter: Adapter
  sendVerificationRequest?: (props: {
    email: string
    token: string
    url: string
  }) => Promise<void>
}) {
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
        sendVerificationRequest: async ({ identifier: email, url, token }) => {
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
    adapter,
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
          (await adapter.getUserByEmail?.(profile.email))
        ) {
          return true
        }
        return "/api/auth/verify?provider=email&type=email"
      },
      jwt({ token, user }) {
        if (user) {
          // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
          token.role = user.email === masterEmail ? "admin" : user.role
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

  // TODO added type annotation to fix https://github.com/nextauthjs/next-auth/discussions/9950
  const auth = nextAuth.auth

  const getRole = async (): Promise<"user" | "admin" | null> => {
    const session = await auth()
    // @ts-expect-error TODO fix auth types https://github.com/nextauthjs/next-auth/issues/9493
    return session?.user?.role || null
  }

  const POST = nextAuth.handlers.POST

  const GET = (req: NextRequest) => {
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

  return {
    getRole,
    auth,
    handlers: {
      POST,
      GET,
    },
  }
}

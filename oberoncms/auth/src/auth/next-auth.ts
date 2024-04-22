import { randomBytes } from "crypto"
import { Resend } from "resend"
import NextAuth, { NextAuthConfig } from "next-auth"

import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import type { Adapter } from "next-auth/adapters"

const masterEmail = process.env.MASTER_EMAIL || null
const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"

export function initAuth(adapter: Adapter) {
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
          if (process.env.NODE_ENV !== "production") {
            console.log(
              `sendVerificationRequest email not sent in ${process.env.NODE_ENV}`,
              { email, url },
            )
            return
          }

          if (!process.env.RESEND_SECRET) {
            throw new Error("No RESEND_SECRET configured")
          }
          const resend = new Resend(process.env.RESEND_SECRET)

          const withCallback = new URL(url)

          withCallback.searchParams.set(
            "callbackUrl",
            `${withCallback.searchParams.get("callbackUrl")}/cms`,
          )

          try {
            const { data } = await resend.emails.send({
              from: emailFrom,
              to: email,
              subject: "One time login to Oberon CMS",
              text: `Sign in with code\n\n${token}\n\n ${withCallback} \n\n`,
            })
            if (!data?.id) {
              console.error("Resend did not return valid response")
              return
            }
            console.log(`Sent email id ${data?.id}`)
          } catch (error) {
            console.error("Signin email failed to send")
          }
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
  } satisfies NextAuthConfig

  const nextAuth = NextAuth(config)

  // TODO added type annotation to fix https://github.com/nextauthjs/next-auth/discussions/9950
  const auth = nextAuth.auth

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
    auth,
    handlers: {
      POST,
      GET,
    },
  }
}

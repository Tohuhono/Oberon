import "server-only"

import { randomBytes } from "crypto"
import { Resend } from "resend"
import NextAuth, { NextAuthResult, NextAuthConfig } from "next-auth"

import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { adapter } from "./next-auth-adapter"

const masterEmail = process.env.MASTER_EMAIL || null
const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"
const resend = new Resend(process.env.RESEND_SECRET)

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

        try {
          const { data } = await resend.emails.send({
            from: emailFrom,
            to: email,
            subject: "One time login to oberon",
            text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
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
        // @ts-expect-error TODO fix global type
        user.role = "admin"
        return true
      }
      // Existing user or email verification
      // @ts-expect-error TODO fix global type
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
        // @ts-expect-error TODO fix global type
        token.role = user.email === masterEmail ? "admin" : user.role
      }
      return token
    },
    session({ session, token }) {
      // @ts-expect-error TODO fix global type
      session.user.role = token.role
      return session
    },
  },
} satisfies NextAuthConfig

// TODO added type annotation to fix https://github.com/nextauthjs/next-auth/discussions/9950
const nextAuth = NextAuth(config)

export const auth: NextAuthResult["auth"] = nextAuth.auth

export const authorize = (
  handler: (req: NextRequest) => Response,
): ReturnType<NextAuthResult["auth"]> =>
  auth((req) => {
    if (!req.auth?.user) {
      return NextResponse.json(null, { status: 401 })
    }
    return handler(req)
  })

export const POST = nextAuth.handlers.POST

export const GET = (req: NextRequest) => {
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

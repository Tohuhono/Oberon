import "server-only"

import { randomBytes } from "crypto"
import { Resend } from "resend"
import NextAuth from "next-auth"

import { NextRequest, NextResponse } from "next/server"
import { NextAuthConfig } from "next-auth"
import { adapter } from "@/puck/src/auth/next-auth-adapter"

const masterEmail = process.env.MASTER_EMAIL || null
const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"
const resend = new Resend(process.env.RESEND_SECRET)

const config = {
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
        user.role = "admin"
        return true
      }
      // Existing user or email verification
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
      return false
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.email === masterEmail ? "admin" : user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth } = NextAuth(config)

export const authorize = (handler: (req: NextRequest) => Response) =>
  auth((req) => {
    if (!req.auth?.user) {
      return NextResponse.json(null, { status: 401 })
    }
    return handler(req)
  })

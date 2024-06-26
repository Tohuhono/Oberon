import { randomBytes } from "crypto"
import { type AuthConfig } from "@auth/core"
import NextAuth from "next-auth"

import { AccessDenied } from "@auth/core/errors"
import { name, version } from "../../package.json" with { type: "json" }
import {
  type OberonCanAdapter,
  type OberonPlugin,
  type OberonUser,
} from "../lib/dtd"

const masterEmail = process.env.MASTER_EMAIL || null

const withCallback = (url: string) => {
  const withCallback = new URL(url)

  withCallback.pathname = "/cms/login"

  const callbackUrl = new URL(
    withCallback.searchParams.get("callbackUrl") || "/cms",
  )

  callbackUrl.pathname = "/cms"

  withCallback.searchParams.set("callbackUrl", callbackUrl.toString())

  return withCallback.toString()
}

export const authPlugin: OberonPlugin = (adapter) => {
  const config = {
    basePath: "/cms/api/auth",
    pages: {
      signIn: "/cms/login",
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

          await adapter.sendVerificationRequest({
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
      async signIn(props) {
        const { user, profile } = props

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

        return false
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

  return {
    name: `${name}/auth`,
    version,
    handlers: {
      auth: () => nextAuth.handlers,
    },
    adapter: {
      getCurrentUser: async () => {
        const session = await nextAuth.auth()

        return (session?.user as OberonUser) || null
      },
      signOut: async () => {
        await nextAuth.signOut()
      },
      signIn: async ({ email }) => {
        try {
          await nextAuth.signIn("email", { redirect: false, email })
        } catch (error) {
          if (error instanceof AccessDenied) {
            return
          }
          throw error
        }
      },
    } satisfies Partial<OberonCanAdapter>,
  }
}

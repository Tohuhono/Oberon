import { betterAuth } from "better-auth/minimal"
import { emailOTP } from "better-auth/plugins"

import type { OberonBetterAuthAdapter, OberonBetterAuthPlugin, OberonSendAdapter } from "../lib/dtd"

export const cmsAuthBasePath = "/cms/api/auth"

const noopSendVerificationRequest: OberonSendAdapter["sendVerificationRequest"] = async () => {}

export function createAuthOptions({
  betterAuth: betterAuthAdapter,
  betterAuthPlugins = [],
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest"> & {
  betterAuth?: OberonBetterAuthAdapter
  betterAuthPlugins?: OberonBetterAuthPlugin[]
}) {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"
  const secret = process.env.AUTH_SECRET

  return {
    ...(betterAuthAdapter ? { database: betterAuthAdapter.database } : {}),
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
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "sign-in") {
            return
          }

          const loginUrl = new URL("/cms/login", "http://localhost")
          loginUrl.searchParams.set("email", email)

          await sendVerificationRequest({
            email,
            token: otp,
            url: `${loginUrl.pathname}${loginUrl.search}`,
          })
        },
      }),
      ...betterAuthPlugins,
    ],
  }
}

export const auth = betterAuth(
  createAuthOptions({
    sendVerificationRequest: noopSendVerificationRequest,
  }),
)

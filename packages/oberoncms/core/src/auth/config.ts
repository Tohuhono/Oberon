import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import type { OberonBetterAuthAdapter, OberonSendAdapter } from "../lib/dtd"

export const cmsAuthBasePath = "/cms/api/auth"

const noopSendVerificationRequest: OberonSendAdapter["sendVerificationRequest"] =
  async () => {}

export function createAuthOptions({
  betterAuth: betterAuthAdapter,
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest"> & {
  betterAuth?: OberonBetterAuthAdapter
}) {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    "oberon-mock-auth-secret-12345678901234567890"

  return {
    ...(betterAuthAdapter ? { database: betterAuthAdapter.database } : {}),
    baseURL,
    basePath: cmsAuthBasePath,
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
      nextCookies(),
    ],
  }
}

export const auth = betterAuth(
  createAuthOptions({
    sendVerificationRequest: noopSendVerificationRequest,
  }),
)

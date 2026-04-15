import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import type { OberonSendAdapter } from "../lib/dtd"

export const cmsAuthBasePath = "/cms/api/auth"

export function createAuthServer({
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest">) {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    "oberon-mock-auth-secret-12345678901234567890"

  return betterAuth({
    baseURL,
    basePath: cmsAuthBasePath,
    secret,
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
    ],
  })
}

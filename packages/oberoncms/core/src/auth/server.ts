import { betterAuth } from "better-auth/minimal"

import type { OberonBetterAuthAdapter, OberonSendAdapter } from "../lib/dtd"
import { createAuthOptions } from "./config"

export { cmsAuthBasePath } from "./config"

export function createAuthServer({
  betterAuth: betterAuthAdapter,
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest"> & {
  betterAuth?: OberonBetterAuthAdapter
}) {
  return betterAuth(
    createAuthOptions({
      betterAuth: betterAuthAdapter,
      sendVerificationRequest,
    }),
  )
}

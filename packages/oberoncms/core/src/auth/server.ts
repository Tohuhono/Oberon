import { betterAuth } from "better-auth/minimal"

import type { OberonBetterAuthAdapter, OberonBetterAuthPlugin, OberonSendAdapter } from "../lib/dtd"
import { createAuthOptions } from "./config"

export { cmsAuthBasePath } from "./config"

export function createAuthServer({
  betterAuth: betterAuthAdapter,
  betterAuthPlugins,
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest"> & {
  betterAuth?: OberonBetterAuthAdapter
  betterAuthPlugins?: OberonBetterAuthPlugin[]
}) {
  return betterAuth(
    createAuthOptions({
      betterAuth: betterAuthAdapter,
      betterAuthPlugins,
      sendVerificationRequest,
    }),
  )
}

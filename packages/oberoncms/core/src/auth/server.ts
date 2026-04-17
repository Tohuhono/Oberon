import { betterAuth } from "better-auth"
import type { OberonSendAdapter } from "../lib/dtd"
import { createAuthOptions } from "./config"

export { cmsAuthBasePath } from "./config"

export function createAuthServer({
  sendVerificationRequest,
}: Pick<OberonSendAdapter, "sendVerificationRequest">) {
  return betterAuth(createAuthOptions({ sendVerificationRequest }))
}

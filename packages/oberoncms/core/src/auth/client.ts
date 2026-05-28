"use client"

import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { cmsAuthBasePath } from "./server"

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: cmsAuthBasePath,
  plugins: [emailOTPClient()],
})

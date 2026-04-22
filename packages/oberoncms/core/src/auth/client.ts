"use client"

import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { cmsAuthBasePath } from "./server"

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: cmsAuthBasePath,
    plugins: [emailOTPClient()],
  },
)

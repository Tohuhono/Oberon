import "server-only"

import { notImplemented } from "@tohuhono/utils"
import type { OberonPlugin } from "@oberoncms/core"

const emailFrom = process.env.EMAIL_FROM

export const csendPlugin: OberonPlugin = () => ({
  name: "Custom Send",
  adapter: {
    sendVerificationRequest: async ({
      email,
      token,
      url,
    }: {
      email: string
      token: string
      url: string
    }) => {
      const msg = {
        from: emailFrom,
        to: email,
        subject: "One time login to Oberon CMS",
        text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
      }
      console.error("Send not configured", msg)
      notImplemented("sendVerificationRequest")
    },
  },
})

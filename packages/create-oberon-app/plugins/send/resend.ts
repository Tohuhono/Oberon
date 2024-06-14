import "server-cli-only"

import { Resend } from "resend"
import {
  USE_DEVELOPMENT_SEND_PLUGIN,
  type OberonPlugin,
  type OberonSendAdapter,
} from "@oberoncms/core"

const EMAIL_FROM = process.env.EMAIL_FROM
const RESEND_SECRET = process.env.RESEND_SECRET || process.env.SEND_SECRET

export const plugin: OberonPlugin = () => ({
  name: "Resend",
  disabled: USE_DEVELOPMENT_SEND_PLUGIN,
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
      if (!RESEND_SECRET) {
        throw new Error("No RESEND_SECRET configured")
      }

      if (!EMAIL_FROM) {
        throw new Error("No EMAIL_FROM configured")
      }

      const msg = {
        from: EMAIL_FROM,
        to: email,
        subject: "One time login to Oberon CMS",
        text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
      }

      const resend = new Resend(RESEND_SECRET)

      try {
        const response = await resend.emails.send(msg)

        if (response.error || !response.data?.id) {
          console.error("Resend response error", response.error)
          throw response.error
        }

        console.log(`Sent email id ${response.data.id}`)
      } catch (error) {
        console.error("Signin email failed to send")
      }
    },
  } satisfies OberonSendAdapter,
})

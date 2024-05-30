import "server-cli-only"

import { Resend } from "resend"
import type { OberonPlugin } from "@oberoncms/core"

const emailFrom = process.env.EMAIL_FROM || "noreply@tohuhono.com"

export const sendAdapterPlugin: OberonPlugin = () => ({
  name: "Resend",
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
      if (!process.env.RESEND_SECRET) {
        throw new Error("No RESEND_SECRET configured")
      }

      console.log("!!!!")

      const resend = new Resend(process.env.RESEND_SECRET)

      try {
        const response = await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: "One time login to Oberon CMS",
          text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
        })

        if (response.error || !response.data?.id) {
          console.error("Resend response error", response.error)
          throw response.error
        }

        console.log(`Sent email id ${response.data.id}`)
      } catch (error) {
        console.error("Signin email failed to send")
      }
    },
  },
})

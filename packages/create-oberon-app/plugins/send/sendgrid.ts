import "server-only"

import sgMail from "@sendgrid/mail"
import type { OberonPlugin } from "@oberoncms/core"

const emailFrom = process.env.EMAIL_FROM

export const sendPlugin: OberonPlugin = () => ({
  name: "Sendgrid",
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
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("No SENDGRID_API_KEY configured")
      }

      const msg = {
        to: email,
        from: emailFrom,
        subject: "One time login to Oberon CMS",
        text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      try {
        await sgMail.send(msg)
      } catch (error) {
        console.error(error)

        if (error.response) {
          console.error(error.response.body)
        }
      }
    },
  },
})

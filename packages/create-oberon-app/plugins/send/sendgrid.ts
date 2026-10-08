import "server-cli-only"
import { USE_DEVELOPMENT_SEND_PLUGIN, type OberonPlugin } from "@oberoncms/core"
import { setApiKey, send } from "@sendgrid/mail"

const EMAIL_FROM = process.env.EMAIL_FROM
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.SEND_SECRET

export const plugin: OberonPlugin = () => ({
  name: "Sendgrid",
  disabled: USE_DEVELOPMENT_SEND_PLUGIN,
  adapter: {
    sendVerificationRequest:
      () =>
      async ({ email, token, url }) => {
        if (!SENDGRID_API_KEY) {
          throw new Error("No SENDGRID_API_KEY configured")
        }

        if (!EMAIL_FROM) {
          throw new Error("No EMAIL_FROM configured")
        }

        const msg = {
          to: email,
          from: EMAIL_FROM,
          subject: "One time login to Oberon CMS",
          text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
        }

        setApiKey(SENDGRID_API_KEY)

        try {
          await send(msg)
        } catch (error) {
          console.error(error)

          if (
            error instanceof Error &&
            "response" in error &&
            typeof error.response === "object" &&
            error.response !== null &&
            "body" in error.response
          ) {
            console.error(error.response.body)
          }
        }
      },
  },
})

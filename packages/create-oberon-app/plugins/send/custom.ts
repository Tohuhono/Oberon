import "server-cli-only"
import { USE_DEVELOPMENT_SEND_PLUGIN, notImplemented, type OberonPlugin } from "@oberoncms/core"

const EMAIL_FROM = process.env.EMAIL_FROM
const SEND_SECRET = process.env.SEND_SECRET

export const plugin: OberonPlugin = () => ({
  name: "Custom Send Plugin",
  disabled: USE_DEVELOPMENT_SEND_PLUGIN,
  adapter: {
    sendVerificationRequest: async ({ payload: { email, token, url } }) => {
      const msg = {
        from: EMAIL_FROM,
        to: email,
        subject: "One time login to Oberon CMS",
        text: `Sign in with code\n\n${token}\n\n ${url} \n\n`,
      }
      console.error("Send not configured", msg)
      notImplemented("sendVerificationRequest")

      if (!SEND_SECRET) {
        throw new Error("No SEND_SECRET configured")
      }
    },
  },
})

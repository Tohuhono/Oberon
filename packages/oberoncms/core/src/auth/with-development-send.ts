import { type OberonPlugin, type OberonSendAdapter } from "@oberoncms/core"

const devSendPlugin: OberonPlugin = () => ({
  adapter: {
    sendVerificationRequest: async ({ email, url }) => {
      console.log(`Logging sendVerificationRequest`, {
        email,
        url,
      })
    },
  } satisfies OberonSendAdapter,
})

export const withDevelopmentSend = (sendPlugin: OberonPlugin) => {
  if (process.env.USE_DEVELOPMENT_SEND === "true") {
    return devSendPlugin
  }

  if (process.env.USE_DEVELOPMENT_SEND === "false") {
    return sendPlugin
  }

  if (process.env.NODE_ENV === "development" && !process.env.CI) {
    return devSendPlugin
  }

  return sendPlugin
}

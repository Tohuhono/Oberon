import { NotImplementedError } from "../lib/dtd"
import type { OberonPlugin } from "../lib/dtd"
import { createAuthPlugin } from "./mock"
import { createAuthServer } from "./server"

function getBetterAuthCapability(adapter: { betterAuth?: unknown }) {
  try {
    const betterAuth = adapter.betterAuth

    if (!betterAuth || typeof betterAuth !== "object") {
      throw new Error()
    }

    if (!("database" in betterAuth)) {
      throw new Error()
    }

    return betterAuth
  } catch (error) {
    if (error instanceof NotImplementedError || error instanceof Error) {
      throw new Error(
        "Missing required Better Auth capability on adapter.betterAuth",
      )
    }

    throw error
  }
}

const betterAuthPluginFactory = createAuthPlugin((adapter) =>
  createAuthServer({
    betterAuth: getBetterAuthCapability(adapter),
    sendVerificationRequest: adapter.sendVerificationRequest,
  }),
)

export const authPlugin: OberonPlugin = (adapter) => {
  getBetterAuthCapability(adapter)

  return betterAuthPluginFactory(adapter)
}

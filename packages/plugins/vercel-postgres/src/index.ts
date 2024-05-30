import "server-cli-only"

import { type OberonPlugin } from "@oberoncms/core"

import { name, version } from "../package.json" with { type: "json" }

import { databaseAdapter } from "./db/database-adapter"
import { authAdapter } from "./db/auth-adapter"
import { prebuild } from "./db/prebuild"

export const databasePlugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    ...databaseAdapter,
    ...authAdapter,
  },
  prebuild: async () => {
    await adapter.prebuild()
    await prebuild()
  },
})

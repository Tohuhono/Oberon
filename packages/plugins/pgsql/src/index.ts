import "server-cli-only"

import { type OberonPlugin } from "@oberoncms/core"

import { name, version } from "../package.json" with { type: "json" }

import { databaseAdapter } from "./db/database-adapter"
import { authAdapter } from "./db/auth-adapter"
import { init } from "./db/init"

export const databasePlugin: OberonPlugin = (adapter) => ({
  name,
  version,
  adapter: {
    ...databaseAdapter,
    ...authAdapter,
    init: async () => {
      await adapter.init()
      await init()
    },
  },
})

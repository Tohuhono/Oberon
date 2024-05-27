import "server-only"

import { type OberonPlugin } from "@oberoncms/core"

import { name, version } from "../package.json" with { type: "json" }

import { databaseAdapter } from "./db/database-adapter"
import { authAdapter } from "./db/auth-adapter"

export const databasePlugin: OberonPlugin = () => ({
  name,
  version,
  adapter: {
    ...databaseAdapter,
    ...authAdapter,
  },
})

import "server-cli-only"

import { initOberon } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"

import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { plugin as uploadthingPlugin } from "@oberoncms/plugin-uploadthing/plugin"
import { plugin as sendPlugin } from "./send"
import { config } from "./config"

export const { adapter, handlers } = initOberon({
  config,
  plugins: [
    developmentPlugin,
    tursoPlugin,
    sendPlugin,
    authPlugin,
    uploadthingPlugin,
  ],
})

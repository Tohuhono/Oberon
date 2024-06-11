import "server-cli-only"

import { initAdapter } from "@oberoncms/core/adapter"
import { authPlugin } from "@oberoncms/core/auth"

import { plugin as developmentPlugin } from "@oberoncms/plugin-development"
import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { plugin as uploadthingPlugin } from "@oberoncms/plugin-uploadthing/plugin"
import { plugin as sendPlugin } from "./send"

export const adapter = initAdapter([
  developmentPlugin,
  tursoPlugin,
  sendPlugin,
  authPlugin,
  uploadthingPlugin,
])

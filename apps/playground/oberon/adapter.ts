import "server-cli-only"

import { initAdapter } from "@oberoncms/core/adapter"
import { authPlugin, withDevelopmentSend } from "@oberoncms/core/auth"
import { withDevelopmentDatabase } from "@oberoncms/plugin-sqlite"

import { plugin as tursoPlugin } from "@oberoncms/plugin-turso"
import { plugin as uploadthingPlugin } from "@oberoncms/plugin-uploadthing/plugin"

import { sendAdapterPlugin } from "./send"

export const adapter = initAdapter([
  withDevelopmentDatabase(tursoPlugin),
  withDevelopmentSend(sendAdapterPlugin),
  authPlugin,
  uploadthingPlugin,
])

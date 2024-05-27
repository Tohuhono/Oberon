import "server-only"

import { databasePlugin } from "@oberoncms/plugin-turso"
import { authPlugin } from "@oberoncms/core/auth"

import { initAdapter } from "@oberoncms/core/adapter"
import { uploadthingPlugin } from "@oberoncms/plugin-uploadthing/plugin"
import { sendAdapterPlugin } from "./send"

export const adapter = initAdapter([
  databasePlugin,
  authPlugin,
  sendAdapterPlugin,
  uploadthingPlugin,
])

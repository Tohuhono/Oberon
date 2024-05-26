import "server-only"

import {
  authAdapterPlugin,
  databaseAdapterPlugin,
} from "@oberoncms/plugin-turso"
import { oberonAuthPlugin } from "@oberoncms/core/auth"

import { initAdapter } from "@oberoncms/core/adapter"
import { uploadthingPlugin } from "@oberoncms/plugin-uploadthing/plugin"
import { sendAdapterPlugin } from "./send"

export const adapter = initAdapter([
  databaseAdapterPlugin,
  authAdapterPlugin,
  sendAdapterPlugin,
  oberonAuthPlugin,
  uploadthingPlugin,
])

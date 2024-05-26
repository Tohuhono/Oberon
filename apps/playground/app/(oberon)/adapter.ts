import "server-only"

import {
  authAdapterPlugin,
  databaseAdapterPlugin,
} from "@oberoncms/adapter-turso"
import { oberonAuthPlugin } from "@oberoncms/core/auth"

import { initAdapter } from "@oberoncms/core/adapter"
import { uploadthingPlugin } from "@oberoncms/upload-thing/plugin"
import { sendAdapterPlugin } from "./send"

export const adapter = initAdapter([
  databaseAdapterPlugin,
  authAdapterPlugin,
  sendAdapterPlugin,
  oberonAuthPlugin,
  uploadthingPlugin,
])

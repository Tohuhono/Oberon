import "server-only"

import {
  authAdapterPlugin,
  databaseAdapterPlugin,
} from "@oberoncms/adapter-vercel-postgres"
import { oberonAuthPlugin } from "@oberoncms/core/auth"

import { initAdapter } from "@oberoncms/core/adapter"
import { sendAdapterPlugin } from "./send"

export const adapter = initAdapter([
  databaseAdapterPlugin,
  authAdapterPlugin,
  sendAdapterPlugin,
  oberonAuthPlugin,
])

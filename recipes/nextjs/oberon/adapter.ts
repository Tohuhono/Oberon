import "server-cli-only";

import { initAdapter, mockPlugin } from "@oberoncms/core/adapter";
import { authPlugin, withDevelopmentSend } from "@oberoncms/core/auth";
import { withDevelopmentDatabase } from "@oberoncms/plugin-sqlite";

export const adapter = initAdapter([
  mockPlugin,
  withDevelopmentDatabase(),
  withDevelopmentSend(),
  authPlugin,
]);

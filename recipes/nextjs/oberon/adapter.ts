import "server-cli-only";

import { initAdapter } from "@oberoncms/core/adapter";
import { databasePlugin } from "@oberoncms/plugin-turso";
import { authPlugin } from "@oberoncms/core/auth";

export const adapter = initAdapter([databasePlugin, authPlugin]);

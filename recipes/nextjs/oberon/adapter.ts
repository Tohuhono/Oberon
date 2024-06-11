import "server-cli-only";

import { initAdapter, mockPlugin } from "@oberoncms/core/adapter";
import { authPlugin } from "@oberoncms/core/auth";
import { plugin as developmentPlugin } from "@oberoncms/plugin-development";

export const adapter = initAdapter([mockPlugin, developmentPlugin, authPlugin]);

import "server-cli-only";

import { initOberon, mockPlugin } from "@oberoncms/core/adapter";
import { authPlugin } from "@oberoncms/core/auth";
import { plugin as developmentPlugin } from "@oberoncms/plugin-development";
import { config } from "./config";

export const { handler, adapter } = initOberon({
  config,
  plugins: [mockPlugin, developmentPlugin, authPlugin],
});

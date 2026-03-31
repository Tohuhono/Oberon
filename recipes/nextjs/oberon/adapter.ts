import "server-cli-only";

import { initOberon, mockPlugin } from "@oberoncms/core/adapter";
import { authPlugin } from "@oberoncms/core/auth";
import { plugin as developmentPlugin } from "@oberoncms/plugin-development";
import { plugin as tailwindPlugin } from "@oberoncms/plugin-tailwind";
import { config } from "./config";

export const { handler, adapter } = initOberon({
  config,
  plugins: [mockPlugin, developmentPlugin, tailwindPlugin, authPlugin],
});

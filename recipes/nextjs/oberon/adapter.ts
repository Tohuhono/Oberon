import "server-cli-only";

import path from "node:path";
import { initOberon, mockPlugin } from "@oberoncms/core/adapter";
import { authPlugin } from "@oberoncms/core/auth";
import { plugin as developmentPlugin } from "@oberoncms/plugin-development";
import { config } from "./config";

export const { handler, adapter } = initOberon({
  config,
  plugins: [mockPlugin, developmentPlugin, authPlugin],
  tailwind: {
    sourceCssFile: path.join(process.cwd(), "app/tailwind-asset.css"),
  },
});

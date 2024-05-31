#!/usr/bin/env node
/* eslint-env node */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { exportTailwindClasses } from "@oberoncms/core";
import { adapter } from "./adapter";

// Script runs before a build
(async () => {
  await adapter.init();
  await exportTailwindClasses(adapter);
})();

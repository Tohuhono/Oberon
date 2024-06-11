#!/usr/bin/env node
import { exportTailwindClasses } from "@oberoncms/core/adapter";
import { adapter } from "./adapter";

// Script runs before a build
(async () => {
  await adapter.prebuild();
  await exportTailwindClasses(adapter);
})();

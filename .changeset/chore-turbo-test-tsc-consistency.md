---
"@config/vite": patch
"@config/vitest": patch
---

Align workspace task/config setup for consistent Turbo `test` and `tsc`
behavior.

- add missing `scripts`, `eslint.config.mjs`, and `tsconfig.json` in
  `@config/vitest`
- normalize root `tsc` and `test` scripts (`--concurrency 50`, remove
  `tsc:root`)
- tighten root and package TypeScript include patterns for config packages
- add explicit empty outputs for Turbo `test` and `lint` tasks
